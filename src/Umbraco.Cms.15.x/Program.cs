using Umbraco.Community.BlockPreview.Extensions;

WebApplicationBuilder builder = WebApplication.CreateBuilder(args);

builder.CreateUmbracoBuilder()
    .AddBackOffice()
    .AddWebsite()
    .AddDeliveryApi()
    .AddComposers()
    .AddBlockPreview(options =>
    {
        options.BlockGrid = new()
        {
            Enabled = true,
            Stylesheet = "/css/myblockgridlayout.css"
        };
        options.BlockList = new()
        {
            Enabled = true,
            Stylesheet = "/css/myblockgridlayout.css"
        };
        options.RichText = new()
        {
            Enabled = true,
            Stylesheet = "/css/myblockgridlayout.css"
        };
    })
    .Build();

WebApplication app = builder.Build();

await app.BootUmbracoAsync();

#if (UseHttpsRedirect)
app.UseHttpsRedirection();
#endif

app.UseUmbraco()
    .WithMiddleware(u =>
    {
        u.UseBackOffice();
        u.UseWebsite();
    })
    .WithEndpoints(u =>
    {
        u.UseBackOfficeEndpoints();
        u.UseWebsiteEndpoints();
    });

await app.RunAsync();
