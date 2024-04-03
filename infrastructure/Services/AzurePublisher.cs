using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace OC_Accelerator.Services
{
    public class AzurePublisher
    {
        public AzurePublisher()
        {

        }

        public void Publish(TextWriter logger)
        {
            // TODO: this probably needs to happen before azure resource generator is called
            var processStartInfo = new ProcessStartInfo();
            processStartInfo.FileName = "powershell.exe"; // ../../../../apps/admin.zip ??
            processStartInfo.Arguments = $"Compress-Archive -Path * -DestinationPath testing.zip";
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
