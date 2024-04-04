using System.ComponentModel.DataAnnotations;

namespace OC_Accelerator.Models
{
    public enum Action
    {
        [Display(Name = "Seed Azure Infrastructure")]
        Seed,
        [Display(Name = "Set local environment variables")]
        EnvVar,
        [Display(Name = "Populate Azure .vscode/settings.json")]
        Settings
    }
}
