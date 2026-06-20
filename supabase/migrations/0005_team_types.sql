CREATE TABLE IF NOT EXISTS team_types (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL,
  criado_em timestamptz DEFAULT now(),
  UNIQUE(nome)
);

ALTER TABLE team_types ENABLE ROW LEVEL SECURITY;

CREATE POLICY "read_team_types" ON team_types
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "write_team_types" ON team_types
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid() AND p.role IN ('admin', 'lider')
    )
  );

INSERT INTO team_types (nome)
VALUES ('Louvor'), ('Organização'), ('Mídia'), ('Culto')
ON CONFLICT (nome) DO NOTHING;
