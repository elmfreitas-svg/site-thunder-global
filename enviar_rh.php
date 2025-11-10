<?php
header('Content-Type: application/json');

// Coleta os dados do POST
$data = json_decode(file_get_contents('php://input'), true);

$nome = $data['nome'] ?? '';
$email = $data['email'] ?? '';
$empresa = $data['empresa'] ?? '';
$cargo = $data['cargo'] ?? '';
$mensagem = $data['mensagem'] ?? '';

// Cabeçalhos do e-mail
$to = "rh@thunderbank.com.br";
$subject = "Candidatura — Trabalhe Conosco";
$body = "Nome: $nome\nE-mail: $email\nEmpresa: $empresa\nCargo: $cargo\nMensagem:\n$mensagem";
$headers = "From: contato@thunderglobalcorp.com\r\n";
$headers .= "Reply-To: $email\r\n";

if (mail($to, $subject, $body, $headers)) {
  echo json_encode(["status" => "ok"]);
} else {
  echo json_encode(["status" => "erro"]);
}
?>
