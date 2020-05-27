<!-- to write data to server -->
<?php
$post_data = json_decode(file_get_contents('php://input'), true); 
// the directory "data" must be writable by the server
$name = "/afs/ir/users/s/o/sonia09/WWW/experiments/cnnBehav/data/".$post_data['filename'].".csv"; 
$data = $post_data['filedata'];
// write the file to disk
file_put_contents($name, $data);
?>