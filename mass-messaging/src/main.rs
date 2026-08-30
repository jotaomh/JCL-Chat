//! mass-messaging — Serviço Rust de broadcast de mensagens em massa.
//!
//! Objetivo futuro: processar e distribuir milhões de mensagens com
//! baixa latência. Nesta fase, é um servidor HTTP de exemplo ("hello world")
//! construído com axum que expõe um endpoint de health check.

use axum::{routing::get, Router};
use std::net::SocketAddr;

/// Função principal — assíncrona usando o runtime do tokio.
#[tokio::main]
async fn main() {
    // Inicializa o logger (imprime logs no terminal)
    tracing_subscriber::fmt::init();

    // Define a porta a partir da variável de ambiente PORT (padrão 8080)
    let port: u16 = std::env::var("PORT")
        .ok()
        .and_then(|v| v.parse().ok())
        .unwrap_or(8080);

    let addr = SocketAddr::from(([0, 0, 0, 0], port));

    // Monta as rotas do servidor
    let app = Router::new()
        // Rota raiz: "hello world"
        .route("/", get(root))
        // Rota de health check (usada pelo docker-compose)
        .route("/api/health", get(health));

    tracing::info!("Servidor Rust rodando em http://{}", addr);

    // Inicia o servidor HTTP
    let listener = tokio::net::TcpListener::bind(addr).await.unwrap();
    axum::serve(listener, app).await.unwrap();
}

/// Handler da rota raiz — retorna uma mensagem de boas-vindas.
async fn root() -> &'static str {
    "JCL-Chat mass-messaging (Rust) está rodando!"
}

/// Handler de health check — retorna o status + versão em JSON.
async fn health() -> axum::Json<serde_json::Value> {
    axum::Json(serde_json::json!({
        "status": "ok",
        "service": "mass-messaging",
        "version": "0.1.0"
    }))
}
