//! Domain error types.

use thiserror::Error;

/// Errors raised by place domain rules, mutations, or persistence ports.
#[derive(Debug, Clone, PartialEq, Eq, Error)]
pub enum DomainError {
    /// Input failed domain validation rules.
    #[error("{0}")]
    Validation(String),
    /// Target place ID already exists.
    #[error("{0}")]
    Conflict(String),
    /// Requested place was not found.
    #[error("{0}")]
    NotFound(String),
    /// Index out of bounds during a webcam operation.
    #[error("{0}")]
    InvalidIndex(String),
    /// Persistence or backing store failure.
    #[error("{0}")]
    Storage(String),
}
