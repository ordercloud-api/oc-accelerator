using System.Diagnostics;

public class BuildBicepFile
{
    public void Run(TextWriter logger, string filePath)
    {
        // Cannot send .bicep files through resource management API. Convert to ARM .json file
        var processStartInfo = new ProcessStartInfo();
        processStartInfo.FileName = "powershell.exe";
        processStartInfo.Arguments = $"-Command az bicep build -f \"{filePath}\"";
        processStartInfo.UseShellExecute = false;
        processStartInfo.RedirectStandardOutput = true;

        using var process = new Process();
        process.StartInfo = processStartInfo;
        process.Start();
        string output = process.StandardOutput.ReadToEnd();
        logger.WriteLine(output);
    }
}