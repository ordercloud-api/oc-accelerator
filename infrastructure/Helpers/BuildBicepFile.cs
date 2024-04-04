using System.Diagnostics;

public class BuildBicepFile
{
    public void Run(TextWriter logger)
    {
        // Cannot send .bicep files through resource management API. Convert to ARM .json file
        var filePath = "../../../Templates/Bicep";
        var templateNames = Directory.GetDirectories(filePath).Select(Path.GetFileName).ToList();
        foreach (var templateName in templateNames)
        {
            var fullFilePath = $"{filePath}/{templateName}";
            var processStartInfo = new ProcessStartInfo();
            processStartInfo.FileName = "powershell.exe";
            processStartInfo.Arguments = $"-Command az bicep build -f \"{fullFilePath}\"";
            processStartInfo.UseShellExecute = false;
            processStartInfo.RedirectStandardOutput = true;

            using var process = new Process();
            process.StartInfo = processStartInfo;
            process.Start();
            string output = process.StandardOutput.ReadToEnd();
            logger.WriteLine(output);
        }
    }
}