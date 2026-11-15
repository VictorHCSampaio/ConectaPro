-- Notificações de chat, aula nova e lembrete de aula.
-- O profile padrão usa spring.jpa.hibernate.ddl-auto=none, então esta tabela
-- precisa existir no PostgreSQL antes de subir a API.

CREATE TABLE IF NOT EXISTS notificacoes (
    id UUID PRIMARY KEY,
    usuario_id UUID NOT NULL REFERENCES usuarios (id),
    titulo VARCHAR(160) NOT NULL,
    mensagem TEXT NOT NULL,
    lida BOOLEAN NOT NULL DEFAULT FALSE,
    data_criacao TIMESTAMPTZ NOT NULL,
    tipo VARCHAR(30) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_notificacoes_usuario_data
    ON notificacoes (usuario_id, data_criacao DESC);

CREATE INDEX IF NOT EXISTS idx_notificacoes_usuario_lida
    ON notificacoes (usuario_id, lida);
