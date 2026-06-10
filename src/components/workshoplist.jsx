/* eslint-disable jsx-a11y/control-has-associated-label */
import axios from 'axios';
import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import EditWSForm from './editWSForm';
import { useUrl } from './UrlProvider';
import convertDateToCzech from '../utils/czechdates';
import Table from './Table';

const WorkshopList = ({ firmId, onSave, firmName, onClose }) => {
  const { apiUrl } = useUrl();
  const [workshops, setWorkshops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedContact, setSelectedContact] = useState(null);

  useEffect(() => {
    const fetchworkshops = async () => {
      try {
        const response = await axios.get(`${apiUrl}workshops/${firmId}`);
        if (Array.isArray(response.data) && response.data.length === 0) {
          console.log('WS žádná data');
        } else {
          setWorkshops(response.data);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchworkshops();
  }, [firmId, selectedContact, apiUrl]);

  const deleteContact = async (contactId) => {
    try {
      const response = await axios.delete(`${apiUrl}/workshops/${contactId}`);
      if (response.status === 200) {
        setWorkshops((prev) => prev.filter((c) => c.id !== contactId));
      } else {
        setError('Smazání WS selhalo');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handledelClick = (contact) => {
    if (window.confirm('Chceš to fakt vymazat?')) {
      deleteContact(contact.id);
    }
  };

  const handleEditClick = (ws) => setSelectedContact(ws);
  const handleClose = () => setSelectedContact(null);
  const handleSave = (updated) => {
    setWorkshops(workshops.map((w) => (w.id === updated.id ? updated : w)));
    setSelectedContact(null);
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && !selectedContact) onClose(null);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedContact, onClose]);

  const tableColumns = [
    { key: 'id', label: 'ID', hidden: true },
    { key: 'date', label: 'Datum', render: (val) => convertDateToCzech(val) },
    { key: 'type', label: 'Typ' },
    { key: 'notes', label: 'Poznámka' },
    {
      key: 'editAction',
      label: '',
      render: (val, row) => <button type="button" onClick={() => handleEditClick(row)}>Upravit</button>,
    },
    {
      key: 'deleteAction',
      label: '',
      render: (val, row) => <button type="button" onClick={() => handledelClick(row)} className="del-btn">Smazat</button>,
    },
  ];

  const renderAppendRow = (cols) => (
    <tr>
      {cols.map((col) => col.hidden ? null : <td key={`empty-ft-${col.key}`} />)}
      <td>
        <button type="button" onClick={() => handleEditClick({ firmId })}>Přidat akci</button>
      </td>
    </tr>
  );

  if (loading) return <p className="no-data">načítání...</p>;

  return (
    <div className={`floating-layer ${!firmId ? 'hidden' : ''}`}>
      {error && <p className="edit-firm-success edit-firm-error">Chyba:&nbsp;{error}</p>}
      <button className="close-button" type="button" onClick={onSave}>X</button>
      {selectedContact ? (
        <EditWSForm contact={selectedContact} onSave={handleSave} onClose={handleClose} />
      ) : (
        <Table
          columns={tableColumns}
          data={workshops}
          className="responsive-table"
          caption={`Akce s firmou ${firmName.split('/(kont)')[0]}`}
          appendRow={renderAppendRow}
        />
      )}
    </div>
  );
};

WorkshopList.propTypes = {
  firmId: PropTypes.string,
  onSave: PropTypes.func.isRequired,
  firmName: PropTypes.string.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default WorkshopList;