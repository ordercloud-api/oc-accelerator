using System.Diagnostics;
using System.Reflection;

namespace OC_Accelerator.Helpers
{
    public class BuildBicepFile
    {
        public void Run(TextWriter logger)
        {
            Console.WriteLine("Building Bicep files...");
            // Cannot send .bicep files through resource management API. Convert to ARM .json file
            var workingDirectory = Path.GetDirectoryName(Assembly.GetEntryAssembly().Location);
            var projectDirectory = Directory.GetParent(workingDirectory)?.Parent?.Parent?.FullName;
            var filePath = Path.Combine(projectDirectory, "Templates", "Bicep");
            var templateNames = Directory.GetFiles(filePath).Select(Path.GetFileName).Where(f => f.Contains(".bicep")).ToList();
            var processStartInfo = new ProcessStartInfo();


            foreach (var templateName in templateNames)
            {
                Console.WriteLine($"Building Bicep files for {templateName}");
                var fullFilePath = $"{filePath}/{templateName}";
                processStartInfo.FileName = "powershell.exe";
                processStartInfo.Arguments = $"-Command az bicep build -f \"{fullFilePath}\"";
                processStartInfo.UseShellExecute = false;
                processStartInfo.RedirectStandardOutput = true;

                using var process = new Process();
                process.StartInfo = processStartInfo;
                process.Start();
                string output = process.StandardOutput.ReadToEnd();
                if (!string.IsNullOrEmpty(output))
                {
                    logger.WriteLine(output);
                }
                process.Dispose();
            }
        }
    }
}