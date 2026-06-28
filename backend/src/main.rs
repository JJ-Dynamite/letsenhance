use axum::{
    routing::{get, post},
    Router, Json, response::IntoResponse,
    extract::Multipart,
};
use tower_http::cors::{CorsLayer, Any};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

#[derive(Serialize)]
struct HealthResponse { status: String, service: String, version: String }
#[derive(Serialize)]
struct RootResponse { service: String, version: String, description: String, endpoints: Vec<String> }
#[derive(Serialize)]
struct EnhanceResponse { id: String, status: String, original_url: String, enhanced_url: String, scale: String }

async fn health() -> impl IntoResponse {
    Json(HealthResponse { status: "healthy".into(), service: "letsenhance".into(), version: "0.1.0".into() })
}

async fn root() -> impl IntoResponse {
    Json(RootResponse {
        service: "letsenhance".into(), version: "0.1.0".into(),
        description: "AI upscale & sharpen images".into(),
        endpoints: vec!["GET /health".into(), "POST /enhance".into()],
    })
}

async fn enhance_image(mut multipart: Multipart) -> impl IntoResponse {
    let id = Uuid::new_v4().to_string();
    while let Some(field) = multipart.next_field().await.unwrap() {
        let _name = field.file_name().unwrap_or("unknown").to_string();
        let _data = field.bytes().await.unwrap();
    }
    Json(EnhanceResponse {
        id: id.clone(), status: "processing".into(),
        original_url: format!("/originals/{}.png", id),
        enhanced_url: format!("/enhanced/{}_4x.png", id),
        scale: "4x".into(),
    })
}

#[tokio::main]
async fn main() {
    tracing_subscriber::fmt::init();
    let cors = CorsLayer::new().allow_origin(Any).allow_methods(Any).allow_headers(Any);
    let app = Router::new()
        .route("/", get(root)).route("/health", get(health))
        .route("/enhance", post(enhance_image))
        .layer(cors);
    let listener = tokio::net::TcpListener::bind("0.0.0.0:3001").await.unwrap();
    tracing::info!("letsenhance backend running on port 3001");
    axum::serve(listener, app).await.unwrap();
}
