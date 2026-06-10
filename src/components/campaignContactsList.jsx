/* eslint-disable jsx-a11y/control-has-associated-label */
import axios from 'axios';
import React, { useMemo, useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import FancyCheckbox from './fancyCheckbox';
import Notification from './notification';
import { useUrl } from './UrlProvider';
import Table from './Table';

const CampaignContactsList = () => {
  const [contacts, setContacts] = useState([]);
  const [selectedContacts, setSelectedContacts] = useState([]);
  const [newStatus, setNewStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { apiUrl, url: EUrl } = useUrl();
  const { id } = useParams();
  const [isErrorVisible, setIsErrorVisible] = useState(false);
  const [isSuccessVisible, setIsSuccessVisible] = useState(false);

  let masterLabel = '';
  const areNoneSelected = selectedContacts.length === 0;

  const areAllSelected = useMemo(() => {
    if (contacts.length === 0) return false;
    const allIds = contacts.map((c) => c.contact_id);
    return allIds.every((cid) => selectedContacts.includes(cid));
  }, [contacts, selectedContacts]);

  if (areAllSelected) {
    masterLabel = 'Zrušit výběr všech';
  } else if (areNoneSelected) {
    masterLabel = 'Vybrat všechny';
  } else {
    masterLabel = 'Invertovat výběr';
  }

  const areSomeSelected = !areNoneSelected && !areAllSelected;

  const isNoReply = (contact) => {
    const s = (contact.status || '').trim();
    const sc = (contact.status_from_cron || '').trim();
    return s === '' && sc === '';
  };

  const selectNoReplyContacts = () => {
    const ids = contacts.filter(isNoReply).map((c) => c.contact_id);
    setSelectedContacts(ids);
  };

  const toggleMaster = () => {
    if (areAllSelected) {
      setSelectedContacts([]);
    } else if (areNoneSelected) {
      const allIds = contacts.map((c) => c.contact_id);
      setSelectedContacts(allIds);
    } else {
      const allIdsSet = new Set(contacts.map((c) => c.contact_id));
      const selectedSet = new Set(selectedContacts);
      const inverted = Array.from(allIdsSet).filter((cId) => !selectedSet.has(cId));
      setSelectedContacts(inverted);
    }
  };

  const exportSelectedToApi = async () => {
    if (selectedContacts.length === 0) {
      alert('Nejsou vybrané žádné kontakty.');
      return;
    }

    try {
      await axios.post(`${EUrl}/rest.php/getCampaignSeindingExport/71/?csvexport`, {
        contact_ids: selectedContacts,
      });
    } finally {
      const random = Math.floor(Math.random() * 1_000_000);
      const baseUrl = `${EUrl}csvexport.csv?rand=${random}`;
      window.open(baseUrl);
    }
  };

  useEffect(() => {
    const fetchContacts = async () => {
      try {
        const response = await axios.get(`${apiUrl}getCampaignContacts/${id}`);
        if (Array.isArray(response.data)) {
          setContacts(response.data);
        } else {
          setIsErrorVisible(true);
          setError('Neplatná odpověď ze serveru.');
        }
      } catch (err) {
        setIsErrorVisible(true);
        setError(`Chyba při načítání: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchContacts();
  }, [id, isSuccessVisible]);

  const handleCheckboxChange = (contactId) => {
    setSelectedContacts((prevContacts) =>
      prevContacts.includes(contactId)
        ? prevContacts.filter((existingId) => existingId !== contactId)
        : [...prevContacts, contactId]
    );
  };

  const selectEmptyStatusContacts = () => {
    const emptyStatusIds = contacts
      .filter((contact) => !contact.status || contact.status.trim() === '')
      .map((contact) => contact.contact_id);

    setSelectedContacts(emptyStatusIds);
  };

  const handleStatusChange = (e) => {
    setNewStatus(e.target.value);
  };

  const handleBulkUpdate = () => {
    if (!newStatus || selectedContacts.length === 0) {
      alert('Vyberte kontakty a status.');
      return;
    }
    setNewStatus('');
    const targetUrl = `${apiUrl}campaignContacts/${id}`;
    const sendData = {
      campaign_id: id,
      contact_ids: selectedContacts,
      status: newStatus,
    };

    axios({ method: 'post', url: targetUrl, data: sendData })
      .then((response) => {
        if (response.data.msg === true) {
          setIsSuccessVisible(true);
          setSelectedContacts([]);
        } else {
          setIsErrorVisible(true);
        }
      })
      .catch((er) => {
        console.error('Chyba při ukládání:', er);
        setIsErrorVisible(true);
      });
  };

  const handleBulkDelete = () => {
    if (selectedContacts.length === 0) return;

    if (!window.confirm('Opravdu chcete smazat vybrané kontakty?')) return;

    const targetUrl = `${apiUrl}campaignContacts/${id}`;
    const sendData = {
      campaign_id: id,
      contact_ids: selectedContacts,
    };

    axios({ method: 'delete', url: targetUrl, data: sendData })
      .then((response) => {
        if (response.data.msg === true) {
          setIsSuccessVisible(true);
          setSelectedContacts([]);
          setContacts((prevContacts) => prevContacts.filter((contact) => !selectedContacts.includes(contact.contact_id)));
        } else {
          setIsErrorVisible(true);
        }
      })
      .catch((err) => {
        console.error('Chyba při mazání:', err);
        setIsErrorVisible(true);
      });
  };

  if (loading) return <p>Načítání...</p>;
  if (error) return <p>Chyba:&nbsp;{error}</p>;

  const tableColumns = [
    {
      key: 'checkbox',
      label: (
        <FancyCheckbox
          indeterminate={areSomeSelected}
          onChange={toggleMaster}
          ariaLabel={masterLabel}
          id="master"
          name="master"
          checked={areAllSelected}
        />
      ),
      render: (val, contact) => (
        <FancyCheckbox
          id={contact.contact_id}
          name={contact.contact_id}
          checked={selectedContacts.includes(contact.contact_id)}
          onChange={() => handleCheckboxChange(contact.contact_id)}
          ariaLabel={`Vybrat kontakt ${contact.contact_id}`}
        />
      ),
    },
    {
      key: 'firm',
      label: 'Firma',
      render: (val, contact) => (
        <Link
          to={`/firm/${encodeURIComponent(contact.firm_name || contact.name || '')}`}
          style={{ cursor: 'pointer', textDecoration: 'underline', color: 'inherit' }}
        >
          {contact.name || `${contact.surname || ''}`}
        </Link>
      ),
    },
    {
      key: 'email',
      label: 'Email',
    },
    {
      key: 'status',
      label: 'Status',
      render: (val) => val || '—',
    },
    {
      key: 'status_from_cron',
      label: 'Status z cronu',
      render: (val) => val || '—',
    },
    {
      key: 'datum_aktualizace',
      label: 'Aktualizace',
      render: (val) => val || '—',
    },
  ];

  return (
    <>
      {isSuccessVisible && <Notification message="Uloženo" type="edit-firm-success" />}
      {isErrorVisible && <Notification message="Chyba při ukládání!" type="edit-firm-error" />}
      
      <div className="campaign-toolbar" style={{ position: 'fixed', top: 58, left: 10, width: '100%', background: 'white', zIndex: 10 }}>
        <h3 style={{ display: 'inline-block', marginRight: '1em' }}>
          Kontakty kampaně #{id}
        </h3>
        <select value={newStatus} onChange={handleStatusChange} className="campaign-select">
          <option value="">-- Změnit status na --</option>
          <option value="doručeno">Doručeno</option>
          <option value="nedoručeno">Nedoručeno</option>
          <option value="nemá zájem">Nemá zájem</option>
          <option value="později">Později</option>
          <option value="ozvou se">Ozvou se</option>
          <option value="bude schůzka/hovor">Bude schůzka/hovor</option>
          <option value="pasívní spolupráce">Pasívní spolupráce</option>
          <option value="aktivní spolupráce">Aktivní spolupráce</option>
          <option value="poslat znovu">Poslat znovu</option>
          <option value="Účastní se">Účastní se</option>
        </select>
        <button type="button" onClick={handleBulkUpdate} style={{ marginLeft: '1em', height: 48 }}>
          Aktualizovat vybrané
        </button>
        <button type="button" onClick={selectEmptyStatusContacts} style={{ marginLeft: '1em', height: 48 }}>
          Vybrat bez statusu
        </button>
        <button type="button" onClick={handleBulkDelete} style={{ marginLeft: '1em', height: 48, backgroundColor: '#e74c3c', color: 'white' }}>
          Smazat vybrané
        </button>
        <button type="button" onClick={selectNoReplyContacts} style={{ marginLeft: '1em', height: 48 }}>
          Vybrat bez odpovědi
        </button>
        <button type="button" onClick={exportSelectedToApi} style={{ marginLeft: '1em', height: 48, backgroundColor: '#8e44ad', color: 'white' }}>
          Export vybraných
        </button>
      </div>

      <Table
        columns={tableColumns}
        data={contacts}
        className="responsive-table"
        headerStyle={{ marginTop: 70 }}
        style={{ marginTop: 70 }}
      />
    </>
  );
};

export default CampaignContactsList;