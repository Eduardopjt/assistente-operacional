import { useState, useEffect } from 'react';
import { useAppStore } from '../store/app-store';
import { financeRepo } from '../services/storage';
import { formatCurrency } from '@assistente/shared';
import type { FinancialEntry } from '@assistente/core';
import './Finance.css';

const CATEGORIES_ENTRADA = [
  'Salário',
  'Freelance',
  'Investimentos',
  'Vendas',
  'Reembolso',
  'Outros',
];

const CATEGORIES_SAIDA = [
  'Alimentação',
  'Transporte',
  'Moradia',
  'Saúde',
  'Educação',
  'Lazer',
  'Impostos',
  'Investimentos',
  'Outros',
];

export default function FinanceScreen() {
  const currentUser = useAppStore((state) => state.currentUser);
  const addFinanceEntry = useAppStore((state) => state.addFinanceEntry);

  const [entries, setEntries] = useState<FinancialEntry[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [type, setType] = useState<'entrada' | 'saida'>('entrada');
  const [value, setValue] = useState('');
  const [category, setCategory] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (currentUser) {
      const recent = financeRepo.getRecent(currentUser.id, 30);
      setEntries(recent);
    }
  }, [currentUser]);

  const totals = entries.reduce(
    (acc, entry) => {
      if (entry.type === 'entrada') {
        acc.entradas += entry.value;
      } else {
        acc.saidas += entry.value;
      }
      return acc;
    },
    { entradas: 0, saidas: 0 }
  );

  const balance = totals.entradas - totals.saidas;

  const handleAddEntry = () => {
    if (!currentUser || !value || !category) return;

    const valueCents = Math.round(parseFloat(value) * 100);

    const entry = financeRepo.create({
      user_id: currentUser.id,
      date: new Date(),
      type,
      value: valueCents,
      category,
      notes: notes || undefined,
    });

    addFinanceEntry(entry);
    setEntries([entry, ...entries]);
    setShowModal(false);
    setValue('');
    setCategory('');
    setNotes('');
  };

  return (
    <div className="finance-screen">
      <div className="finance-content">
        <div className="finance-header">
          <h1>💰 Finanças</h1>
          <button className="add-button" onClick={() => setShowModal(true)}>
            + Nova Entrada
          </button>
        </div>

        <div className="summary-card">
          <div className="summary-item">
            <span className="summary-label">Entradas</span>
            <span className="summary-value positive">{formatCurrency(totals.entradas)}</span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Saídas</span>
            <span className="summary-value negative">{formatCurrency(totals.saidas)}</span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Saldo</span>
            <span className={`summary-value ${balance >= 0 ? 'positive' : 'negative'}`}>
              {formatCurrency(balance)}
            </span>
          </div>
        </div>

        <div className="entries-list">
          {entries.length === 0 ? (
            <div className="empty-state">
              <p>Nenhuma entrada registrada</p>
            </div>
          ) : (
            entries.map((entry) => (
              <div key={entry.id} className="entry-item">
                <div className="entry-info">
                  <span className="entry-category">{entry.category}</span>
                  {entry.notes && <span className="entry-notes">{entry.notes}</span>}
                  <span className="entry-date">
                    {new Date(entry.date).toLocaleDateString('pt-BR')}
                  </span>
                </div>
                <span
                  className={`entry-value ${entry.type === 'entrada' ? 'positive' : 'negative'}`}
                >
                  {entry.type === 'entrada' ? '+' : '-'} {formatCurrency(entry.value)}
                </span>
              </div>
            ))
          )}
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Nova Entrada Financeira</h2>

            <div className="type-toggle">
              <button
                className={`type-button ${type === 'entrada' ? 'active' : ''}`}
                onClick={() => setType('entrada')}
              >
                Entrada
              </button>
              <button
                className={`type-button ${type === 'saida' ? 'active' : ''}`}
                onClick={() => setType('saida')}
              >
                Saída
              </button>
            </div>

            <input
              className="input"
              type="number"
              placeholder="Valor (R$)"
              value={value}
              onChange={(e) => setValue(e.target.value)}
            />

            <div className="category-grid">
              {(type === 'entrada' ? CATEGORIES_ENTRADA : CATEGORIES_SAIDA).map((cat) => (
                <button
                  key={cat}
                  className={`category-button ${category === cat ? 'active' : ''}`}
                  onClick={() => setCategory(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>

            <textarea
              className="input textarea"
              placeholder="Observações (opcional)"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />

            <div className="modal-buttons">
              <button className="modal-button cancel" onClick={() => setShowModal(false)}>
                Cancelar
              </button>
              <button className="modal-button save" onClick={handleAddEntry}>
                Salvar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
