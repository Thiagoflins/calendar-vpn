import { Person } from '@/types';

export const MOCK_PEOPLE: Person[] = [
  { id: 'p1', nome: 'Pr. Roberto Silva', email: 'roberto@vpn.com', telefone: '(11) 99999-0001', funcoes: ['Pastor'], equipeIds: [], ativo: true, observacao: '' },
  { id: 'p2', nome: 'João Santos', email: 'joao@vpn.com', telefone: '(11) 98888-0002', funcoes: ['Teclado', 'Vocal'], equipeIds: ['t1'], ativo: true, observacao: '' },
  { id: 'p3', nome: 'Maria Costa', email: 'maria@vpn.com', telefone: '(11) 97777-0003', funcoes: ['Vocal'], equipeIds: ['t1'], ativo: true, observacao: '' },
  { id: 'p4', nome: 'Pedro Almeida', email: 'pedro@vpn.com', telefone: '(11) 96666-0004', funcoes: ['Bateria'], equipeIds: ['t1'], ativo: true, observacao: '' },
  { id: 'p5', nome: 'Ana Lima', email: 'ana@vpn.com', telefone: '(11) 95555-0005', funcoes: ['Vocal'], equipeIds: ['t1'], ativo: true, observacao: '' },
  { id: 'p6', nome: 'Carlos Souza', email: 'carlos@vpn.com', telefone: '(11) 94444-0006', funcoes: ['Baixo'], equipeIds: ['t1'], ativo: true, observacao: '' },
  { id: 'p7', nome: 'Fernanda Barros', email: 'fernanda@vpn.com', telefone: '(11) 93333-0007', funcoes: ['Recepção', 'Organização'], equipeIds: ['t2', 't4'], ativo: true, observacao: '' },
  { id: 'p8', nome: 'Lucas Ferreira', email: 'lucas@vpn.com', telefone: '(11) 92222-0008', funcoes: ['Mídia'], equipeIds: ['t3'], ativo: true, observacao: '' },
  { id: 'p9', nome: 'Beatriz Mendes', email: 'beatriz@vpn.com', telefone: '(11) 91111-0009', funcoes: ['Vocal'], equipeIds: ['t1'], ativo: true, observacao: '' },
  { id: 'p10', nome: 'Rafael Costa', email: 'rafael@vpn.com', telefone: '(11) 90000-0010', funcoes: ['Organização'], equipeIds: ['t2'], ativo: true, observacao: '' },
  { id: 'p11', nome: 'Juliana Oliveira', email: 'juliana@vpn.com', telefone: '(11) 89999-0011', funcoes: ['Recepção'], equipeIds: ['t4'], ativo: true, observacao: '' },
  { id: 'p12', nome: 'Eduardo Santos', email: 'edu@vpn.com', telefone: '(11) 88888-0012', funcoes: ['Guitarra'], equipeIds: ['t1'], ativo: false, observacao: 'Em viagem' },
];
