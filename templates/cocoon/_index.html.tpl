<!DOCTYPE html>
<html>

<head>
    <title><%=_.slugify(projectName)%></title>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1">
    <meta name="description" content="flappy-bird-reborn">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <link rel="stylesheet" href="http://netdna.bootstrapcdn.com/bootstrap/3.0.3/css/bootstrap.min.css">
    <link rel="stylesheet" href="css/markdown.css">
</head>

<body>
    <div class="container">
        <div class="row text-center">
            <h1><%=_.slugify(projectName)%></h1>
            <p>Open up your CocoonJS Viewer, tap the QR Code Symbol, and point it at this screen</p>
        </div>
        <div class="row-fluid text-center">
            <div id="qr-code" class="span12"></div>
        </div>
        <div class="row-fluid text-center">
            <a href="/">View Game<a/>
      
    </div>
  </body>
  <script type="text/javascript" src="js/jquery.min.js"></script>
  <script type="text/javascript" src="js/qrcode.min.js"></script>
  <script>
    new QRCode(document.getElementById("qr-code"), "http://<%= localServer.ip %>:<%= localServer.port %>/<%=_.slugify(projectName)%>.zip");
  </script>
</html>
