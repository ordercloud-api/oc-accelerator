using System.Collections.Concurrent;
using Microsoft.VisualStudio.Services.Common;
using Microsoft.VisualStudio.Services.WebApi;
using Newtonsoft.Json;
using OC_Accelerator.Models;
using Microsoft.TeamFoundation.Build.WebApi;
using Microsoft.TeamFoundation.DistributedTask.Common.Contracts;
using Microsoft.VisualStudio.Services.ReleaseManagement.WebApi;
using Microsoft.VisualStudio.Services.ReleaseManagement.WebApi.Clients;
using Microsoft.VisualStudio.Services.ReleaseManagement.WebApi.Contracts;
using Artifact = Microsoft.VisualStudio.Services.ReleaseManagement.WebApi.Contracts.Artifact;

namespace OC_Accelerator.Services
{
    public class DevOps
    {
        private readonly IAppSettings _appSettings;

        public DevOps(IAppSettings appSettings)
        {
            _appSettings = appSettings;
        }

        public async Task Run(TextWriter logger, AzResourceGeneratorResponse arm)
        {
            string artifactName = "middleware";
            string pipelineName = "alsn-Accelerator";
            Guid devOpsProjectGuid = new Guid(_appSettings.azureDevOpsProjectID);
            // TODO: Can we make this login like ARM client, i.e. InteractiveBrowser?
            var credentials = new VssBasicCredential(string.Empty, _appSettings.devOpsPersonalAccessToken);
            Uri orgUrl = new Uri("https://dev.azure.com/OrderCloud/");
            VssConnection connection = new VssConnection(orgUrl, credentials);
            await connection.ConnectAsync(VssConnectMode.User);


            // TODO: Keep this? This triggered builds when new commits were pushed to Dev
            /**
             *  CreatePipelineParameters createPipelineParams = new CreatePipelineParameters
                {
                    Name = pipelineName,
                    Folder = "//",
                    Configuration = new CreateYamlPipelineConfigurationParameters
                    {
                        Path = "./azure-pipelines.yml",
                        Repository = new CreateGitHubRepositoryParameters
                        {
                            FullName = "amrarick26/dotnet-middleware",
                            Connection = new CreateServiceConnectionParameters()
                            {
                                Id = new Guid(_appSettings.azureGitHubServiceConnectionId)
                            } // https://learn.microsoft.com/en-us/azure/devops/pipelines/library/service-endpoints?view=azure-devops&tabs=yaml#sep-github
                        }
                    },
                };

                var pipeline = await pipelineClient.CreatePipelineAsync(createPipelineParams, "Sandbox");
             */


            // DEFINE BUILD
            BuildHttpClient buildClient = new BuildHttpClient(orgUrl, credentials);
            BuildDefinition buildDefinition = new BuildDefinition
            {
                Id = 0, // TODO: clean this up - not sure what's necessary
                Name = pipelineName,
                Url = null,
                Uri = null,
                Path = null,
                Type = (DefinitionType)2, // 1 xaml, 2 build
                QueueStatus = DefinitionQueueStatus.Enabled,
                Revision = null,
                CreatedDate = default,
                Project = null,
                DefinitionQuality = null,
                AuthoredBy = null,
                ParentDefinition = null,
                Queue = new AgentPoolQueue()
                {
                    Name = "Azure Pipelines",
                    Pool = new TaskAgentPoolReference()
                    {
                        Id = 15, // TODO: what is this referring to?
                        Name = "Azure Pipelines",
                        IsHosted = true
                    }
                },
                BuildNumberFormat = null,
                Comment = null,
                Description = null,
                DropLocation = null,
                JobAuthorizationScope = (BuildAuthorizationScope)2,
                JobTimeoutInMinutes = 0,
                JobCancelTimeoutInMinutes = 0,
                BadgeEnabled = false,
                Process = new YamlProcess
                {
                    YamlFilename = "azure-pipelines.yml"
                },
                Repository = new BuildRepository
                {
                    Id =
                        "amrarick26/dotnet-middleware", 
                    Type = "GitHub",
                    Name = "amrarick26/dotnet-middleware",
                    Url = new Uri("https://github.com/amrarick26/dotnet-middleware.git"),
                    DefaultBranch = "dev"

                },
                ProcessParameters = null
            };

            buildDefinition.Repository.Properties.Add("connectedServiceId", _appSettings.azureGitHubServiceConnectionId);

            var connectionStringVariable = new BuildDefinitionVariable()
            {
                AllowOverride = true,
                IsSecret = true,
                Value = ""
            };

            var appServiceNameVariable = new BuildDefinitionVariable()
            {
                AllowOverride = true,
                IsSecret = false,
                Value = arm.azFuncAppName
            };

            buildDefinition.Variables.Add("appConfigConnectionString", connectionStringVariable);
            buildDefinition.Variables.Add("APP_SERVICE_NAME", appServiceNameVariable);
            try
            {
                await logger.WriteLineAsync($"Creating Build Definition {buildDefinition.Name}");
                buildDefinition = await buildClient.CreateDefinitionAsync(buildDefinition, devOpsProjectGuid);
            }
            catch (Exception ex)
            {
                Console.ForegroundColor = ConsoleColor.Red;
                await logger.WriteLineAsync(ex.Message);
            }

            // QUEUE BUILD
            // TODO: clean this up - not sure what's necessary
            //var build = new Build
            //{
            //    Id = 0,
            //    BuildNumber = null,
            //    Status = null,
            //    Result = null,
            //    QueueTime = null,
            //    StartTime = null,
            //    FinishTime = null,
            //    Url = null,
            //    Definition = buildDefinition,
            //    BuildNumberRevision = null,
            //    Project = null,
            //    Uri = null,
            //    SourceBranch = null,
            //    SourceVersion = null,
            //    Queue = null,
            //    AgentSpecification = null,
            //    Controller = null,
            //    QueuePosition = null,
            //    Priority = (QueuePriority)3,
            //    Reason = BuildReason.None,
            //    RequestedFor = null,
            //    RequestedBy = null,
            //    LastChangedDate = default,
            //    LastChangedBy = null,
            //    DeletedDate = null,
            //    DeletedBy = null,
            //    DeletedReason = null,
            //    Parameters = null,
            //    Demands = null,
            //    OrchestrationPlan = null,
            //    Plans = null,
            //    Logs = null,
            //    Repository = null,
            //    QueueOptions = QueueOptions.None,
            //    Deleted = false,
            //    Quality = null,
            //    RetainedByRelease = null,
            //    TemplateParameters = null,
            //    TriggeredByBuild = null, // QueueOptions.DoNotRun = Create a plan Id for the build, do not run it
            //};

            //try
            //{
            //    await logger.WriteLineAsync("Queuing Build");
            //    build = await buildClient.QueueBuildAsync(build, devOpsProjectGuid);
            //    // TODO: how do we know this is done so we can trigger a release?

            //}
            //catch (Exception ex)
            //{
            //    Console.ForegroundColor = ConsoleColor.Red;
            //    await logger.WriteLineAsync(ex.Message);
            //}

            var releaseClient = connection.GetClient<ReleaseHttpClient>();

            var releaseDefinitionString = File.ReadAllText("../../../Templates/releaseDefinition.json");
            var releaseDefinition = JsonConvert.DeserializeObject<ReleaseDefinition>(releaseDefinitionString);
            releaseDefinition.Name = $"alsn: {artifactName} Release Pipeline";

            // DEFINE TASK INPUTS FOR RELEASE
            var connectedServiceNameInput = new TaskInputDefinitionBase()
            {
                Name = "ConnectedServiceName",
                DefaultValue = _appSettings.azureResourceManagerServiceConnectionId,
                Label = "Azure Subscription",
                Required = true,
                InputType = "connectedService:AzureRM"
            };

            var appTypeInput = new TaskInputDefinitionBase()
            {
                Name = "WebAppKind",
                DefaultValue = "webApp",
                Label = "App type",
                InputType = "pickList",
                Options =
                {
                    {
                        "webApp", "Web App on Windows"
                    }

                },
                Properties = {
                    {
                        "EditableOptions", "false"
                    }
                }
            };

            var appServiceNameInput = new TaskInputDefinitionBase()
            {
                Name = "WebAppName",
                DefaultValue = arm.azFuncAppName,
                Label = "App service name",
                Required = true,
                InputType = "pickList",
                Properties = {
                    {
                        "EditableOptions", "True"
                    }
                }
            };

            var modifiedInputs = new List<TaskInputDefinitionBase>()
            {
                connectedServiceNameInput, appTypeInput, appServiceNameInput
            };
            releaseDefinition.Environments.FirstOrDefault().ProcessParameters.Inputs.AddRange(modifiedInputs);
            // TODO: this is kind of sketchy?
            releaseDefinition.Environments.FirstOrDefault().DeployPhases.FirstOrDefault().WorkflowTasks
                .FirstOrDefault(t => t.TaskId == new Guid(_appSettings.appServiceTaskID)).Inputs.Add("Package", $"$(System.DefaultWorkingDirectory)/_{pipelineName}/{artifactName}/Customer.OrderCloud.Api");


            // DEFINE ARTIFACTS
            var artifactDefinitionReferences = new ConcurrentDictionary<string, ArtifactSourceReference>();

            var projectReference = new ArtifactSourceReference()
            {
                Id = _appSettings.azureDevOpsProjectID,
                Name = "Sandbox",
            };
            artifactDefinitionReferences.TryAdd("project", projectReference);

            var buildDefinitionReference = new ArtifactSourceReference()
            {
                Id = buildDefinition.Id.ToString(),
                Name = pipelineName
            };
            artifactDefinitionReferences.TryAdd("definition", buildDefinitionReference);

            var pipelineVersionDefinition = new ArtifactSourceReference()
            {
                Id = "latestType",
                Name = "Latest"
            };
            artifactDefinitionReferences.TryAdd("defaultVersionType", pipelineVersionDefinition);

            releaseDefinition.Artifacts = new List<Artifact>()
            {
                new()
                {
                    Type = "Build",
                    Alias = $"_{pipelineName}",
                    IsPrimary = true,
                    IsRetained = false,
                    DefinitionReference = artifactDefinitionReferences
                }
            };

            // CREATE RELEASE DEFINITION
            try
            {
                await logger.WriteLineAsync($"Creating Release Definition {releaseDefinition.Name}");
                releaseDefinition = await releaseClient.CreateReleaseDefinitionAsync(releaseDefinition, devOpsProjectGuid);
            }
            catch (Exception ex)
            {
                Console.ForegroundColor = ConsoleColor.Red;
                await logger.WriteLineAsync(ex.Message);
            }

            //var releaseMetaData = new ReleaseStartMetadata
            //{
            //    DefinitionId = releaseDefinition.Id,
            //    Description = null,
            //    IsDraft = false,
            //    EnvironmentsMetadata = null,
            //    Properties = null
            //};

            //var artifactMetaData = new ArtifactMetadata()
            //{
            //    Alias = $"_{pipelineName}",
            //    InstanceReference = new BuildVersion
            //    {
            //        // TODO: fix hardcoded values 
            //        Id = build.Id.ToString(), 
            //        Name = build.BuildNumber, 
            //        DefinitionId = buildDefinition.Id.ToString(), 
            //        DefinitionName = buildDefinition.Name,
            //        SourceBranch = "refs/heads/dev",
            //        SourceRepositoryId = "amrarick26/dotnet-middleware",
            //        SourceRepositoryType = "GitHub",
            //    }
            //};

            //releaseMetaData.Artifacts.Add(artifactMetaData);

            //// CREATE RELEASE
            //// TODO: this doesn't throw an error but in the DevOps UI it fails because the build number is not recognized (isn't finished building)
            //// Configure the release to automatically deploy after a successful build?
            //try
            //{
            //    await logger.WriteLineAsync("Creating Release");
            //    await releaseClient.CreateReleaseAsync(releaseMetaData, devOpsProjectGuid);
            //} catch (Exception ex)
            //{
            //    Console.ForegroundColor = ConsoleColor.Red;
            //    await logger.WriteLineAsync(ex.Message);
            //}
        }
    }
}
