using Microsoft.AspNetCore.Mvc;

namespace SYNC.Api.Controllers;

public class AuthController : Controller
{
    // GET
    public IActionResult Index()
    {
        return View();
    }
}