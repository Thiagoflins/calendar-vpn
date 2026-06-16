-- Tabela de funções/ministérios
CREATE TABLE IF NOT EXISTS funcoes (
  id       uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome     text NOT NULL,
  criado_em timestamptz DEFAULT now(),
  UNIQUE(nome)
);

ALTER TABLE funcoes ENABLE ROW LEVEL SECURITY;

-- Qualquer autenticado pode ler
CREATE POLICY "auth read funcoes" ON funcoes
  FOR SELECT USING (auth.role() = 'authenticated');

-- Admin/líder pode criar, editar e excluir
CREATE POLICY "admin write funcoes" ON funcoes FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('admin','lider')))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('admin','lider')));

-- Dados iniciais (funções já existentes no sistema)
INSERT INTO funcoes (nome) VALUES
  ('Pastor'),('Vocal'),('Teclado'),('Bateria'),('Baixo'),
  ('Guitarra'),('Percussão'),('Violão'),('Mídia'),('Recepção'),
  ('Pregador'),('Organização'),('Diaconato'),('Ujv')
ON CONFLICT (nome) DO NOTHING;
