using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace OC_Accelerator.Helpers
{
    public class IdentifyAppNames
    {
        public List<string> Run(TextWriter logger)
        {
            // TODO: this probably doesn't need it's own file
            var directories = Directory.GetDirectories("../../../../apps").Select(Path.GetFileName);
            logger.WriteLine($"Found the following directories under apps: {string.Join(", ", directories)}");
            return directories.ToList();
        }
    }
}
