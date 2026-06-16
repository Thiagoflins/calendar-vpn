-- 1. Adicionar colunas de auditoria na tabela events
ALTER TABLE events
  ADD COLUMN IF NOT EXISTS criado_por uuid REFERENCES profiles(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS atualizado_por uuid REFERENCES profiles(id) ON DELETE SET NULL;

-- 2. Atualizar trigger set_atualizado_em para também registrar atualizado_por
CREATE OR REPLACE FUNCTION set_atualizado_em()
RETURNS TRIGGER AS $$
BEGIN
  NEW.atualizado_em = now();
  BEGIN
    NEW.atualizado_por = auth.uid();
  EXCEPTION WHEN OTHERS THEN
    NULL; -- ignora se auth.uid() não estiver disponível (ex: migração direta)
  END;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3. Trigger para registrar criado_por automaticamente no insert
CREATE OR REPLACE FUNCTION set_criado_por()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.criado_por IS NULL THEN
    BEGIN
      NEW.criado_por = auth.uid();
    EXCEPTION WHEN OTHERS THEN
      NULL;
    END;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_events_criado_por ON events;
CREATE TRIGGER trg_events_criado_por
BEFORE INSERT ON events
FOR EACH ROW EXECUTE FUNCTION set_criado_por();

-- 4. Tabela de log de auditoria (registra criações, edições e exclusões)
CREATE TABLE IF NOT EXISTS event_audit_log (
  id           uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id     uuid,                                              -- sem FK pois evento pode ser excluído
  event_nome   text        NOT NULL,
  action       text        NOT NULL CHECK (action IN ('criado', 'atualizado', 'excluido')),
  usuario_id   uuid        REFERENCES profiles(id) ON DELETE SET NULL,
  usuario_nome text,
  criado_em    timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_audit_event_id  ON event_audit_log(event_id);
CREATE INDEX IF NOT EXISTS idx_audit_criado_em ON event_audit_log(criado_em DESC);

-- 5. RLS da tabela de auditoria
ALTER TABLE event_audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "auth read audit"   ON event_audit_log FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "auth insert audit" ON event_audit_log FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- 6. Função de auditoria (INSERT / UPDATE / DELETE)
CREATE OR REPLACE FUNCTION log_event_change()
RETURNS TRIGGER AS $$
DECLARE
  usr_id   uuid;
  usr_nome text;
BEGIN
  BEGIN
    usr_id := auth.uid();
    SELECT nome INTO usr_nome FROM profiles WHERE id = usr_id;
  EXCEPTION WHEN OTHERS THEN
    usr_id   := NULL;
    usr_nome := 'Sistema';
  END;

  IF (TG_OP = 'INSERT') THEN
    INSERT INTO event_audit_log (event_id, event_nome, action, usuario_id, usuario_nome)
    VALUES (NEW.id, NEW.nome, 'criado', usr_id, COALESCE(usr_nome, 'Sistema'));
    RETURN NEW;

  ELSIF (TG_OP = 'UPDATE') THEN
    INSERT INTO event_audit_log (event_id, event_nome, action, usuario_id, usuario_nome)
    VALUES (NEW.id, NEW.nome, 'atualizado', usr_id, COALESCE(usr_nome, 'Sistema'));
    RETURN NEW;

  ELSIF (TG_OP = 'DELETE') THEN
    INSERT INTO event_audit_log (event_id, event_nome, action, usuario_id, usuario_nome)
    VALUES (OLD.id, OLD.nome, 'excluido', usr_id, COALESCE(usr_nome, 'Sistema'));
    RETURN OLD;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_event_audit ON events;
CREATE TRIGGER trg_event_audit
AFTER INSERT OR UPDATE OR DELETE ON events
FOR EACH ROW EXECUTE FUNCTION log_event_change();

-- 7. Permitir que usuários autenticados leiam perfis (para exibir nomes nos logs)
--    A política anterior só permitia ler o próprio perfil.
DROP POLICY IF EXISTS "auth read profiles" ON profiles;
CREATE POLICY "auth read profiles" ON profiles
  FOR SELECT USING (auth.role() = 'authenticated');
