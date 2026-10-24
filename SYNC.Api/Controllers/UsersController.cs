using Microsoft.AspNetCore.Mvc;

namespace SYNC.Api.Controllers;

public class UsersController : Controller
{
    // GET
    public IActionResult Index()
    {
        return View();
    }
}