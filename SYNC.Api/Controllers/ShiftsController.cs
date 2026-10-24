using Microsoft.AspNetCore.Mvc;

namespace SYNC.Api.Controllers;

public class ShiftsController : Controller
{
    // GET
    public IActionResult Index()
    {
        return View();
    }
}