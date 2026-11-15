-- RF27 chat e RF29 denúncia.
-- O profile padrão usa spring.jpa.hibernate.ddl-auto=none, então estas tabelas
-- precisam existir no PostgreSQL antes de subir a API.

CREATE TABLE IF NOT EXISTS mensagens (
    id UUID PRIMARY KEY,
    remetente_id UUID NOT NULL REFERENCES usuarios (id),
    destinatario_id UUID NOT NULL REFERENCES usuarios (id),
    conteudo TEXT NOT NULL,
    lida BOOLEAN NOT NULL DEFAULT FALSE,
    data_envio TIMESTAMPTZ NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_mensagens_remetente_destinatario_data
    ON mensagens (remetente_id, destinatario_id, data_envio);

CREATE TABLE IF NOT EXISTS denuncias (
    id UUID PRIMARY KEY,
    denunciante_id UUID NOT NULL REFERENCES usuarios (id),
    denunciado_id UUID NOT NULL REFERENCES professor (id),
    motivo VARCHAR(40) NOT NULL,
    descricao TEXT NOT NULL,
    status VARCHAR(20) NOT NULL,
    data_criacao TIMESTAMPTZ NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_denuncias_denunciado
    ON denuncias (denunciado_id, data_criacao);
