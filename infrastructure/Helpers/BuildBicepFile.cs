using System.Diagnostics;

namespace OC_Accelerator.Helpers
{
    public class BuildBicepFile
    {
        public void Run(TextWriter logger)
        {
            // Cannot send .bicep files through resource management API. Convert to ARM .json file
            var filePath = "../../../Templates/Bicep";
            var templateNames = Directory.GetFiles(filePath).Select(Path.GetFileName).Where(f => f.Contains(".bicep")).ToList();
            var processStartInfo = new ProcessStartInfo();
            
            foreach (var templateName in templateNames)
            {
                var fullFilePath = $"{filePath}/{templateName}";
                processStartInfo.FileName = "powershell.exe";
                processStartInfo.Arguments = $"-Command az bicep build -f \"{fullFilePath}\"";
                processStartInfo.UseShellExecute = false;
                processStartInfo.RedirectStandardOutput = true;

                using var process = new Process();
                process.StartInfo = processStartInfo;
                process.Start();
                string output = process.StandardOutput.ReadToEnd();
                logger.WriteLine(output);
                process.Dispose();
            }
        }
    }
}