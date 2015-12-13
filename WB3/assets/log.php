<?php
$myFile = "data.txt";
$fh = fopen($myFile, 'a+') or die("can't open file");
$stringData = "\r\n".date("d-m-Y h:i:s")."  -  ".$_GET["data"];
fwrite($fh, $stringData);
fclose($fh);
?>
