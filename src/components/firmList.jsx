/* eslint-disable no-unused-vars */
/* eslint-disable jsx-a11y/control-has-associated-label */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/label-has-associated-control */
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ContactList from './contactList';
import Filter from './filter';
import EditFirmForm from './firmform';
import FutureEvents from './futureEvents';
import GiftList from './giftList';
import MeetList from './meetList';
import Notification from './notification';
import PracticeList from './practiceList';
import { useUrl } from './UrlProvider';
import WorkshopList from './workshoplist';
import { setCookie, getCookie } from '../utils/cookie';
import useIsSmall from '../utils/mobileDetect';
import Table from './Table'; // <-- Import nové komponenty

const getFirstPart = (text) => {
  const parts = text?.split(/\/\(kont\)/) ?? [];
  return parts[0];
};

const FirmList = () => {
  const isSmall = useIsSmall();
  const [data, setData] = useState([]);
  const [Restdata, setRestData] = useState([]);
  const [restFilter, setRestFilter] = useState(false);
  const navigate = useNavigate();
  const [prevData, setprevData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedFirm, setSelectedFirm] = useState(null);
  const [selectedFirmName, setSelectedFirmName] = useState(null);
  const [selectedContact, setSelectedContact] = useState(null);
  const [selectedMeet, setSelectedMeet] = useState(null);
  const [selectedGift, setSelectedGift] = useState(null);
  const [selectedPractice, setSelectedPractice] = useState(null);
  const [selectedWS, setSelectedWS] = useState(0);
  const { url, apiUrl, user } = useUrl();
  const [filterText, setFilterText] = useState('');
  const [contactResult, setContactResult] = useState('');
  const [searchContact, setSearchContact] = useState(false);
  const [selection, setSelection] = useState(false);
  const [isWrapped, setIsWrapped] = useState(false);
  const [copied, setCopied] = useState(false);

  const { idFromURL, firmName } = useParams();

  const [selectedIds, setSelectedIds] = useState(new Set());
  const [selectionText, setSelectionText] = useState('');
  const [lastSelectedIndex, setLastSelectedIndex] = useState(null);

  const toggleSelectWithShift = (index, id, shiftKey) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      const willSelect = !next.has(id);

      if (shiftKey && lastSelectedIndex !== null) {
        const start = Math.min(lastSelectedIndex, index);
        const end = Math.max(lastSelectedIndex, index);
        const idsInRange = data.slice(start, end + 1).map((row) => row.id);

        idsInRange.forEach((rid) => {
          if (willSelect) {
            next.add(rid);
          } else {
            next.delete(rid);
          }
        });
      } else if (willSelect) {
        next.add(id);
      } else {
        next.delete(id);
      }
      return next;
    });

    setLastSelectedIndex(index);
  };

  const handleClearSelection = () => {
    setSelectedIds(new Set());
    setSelectionText('');
    setLastSelectedIndex(null);
  };

  const handlePasteToPage = () => {
    const namesById = new Map(prevData.map((item) => [item.id, item.name]));
    const names = Array.from(selectedIds)
      .map((sid) => getFirstPart(namesById.get(sid) ?? ''))
      .filter(Boolean);
    const text = names.join('; ');
    setSelectionText(text);
  };

  const makeHandleFilter = (value, event) => {
    if (value === undefined || value.length < 2) {
      return;
    }
    const normalizedValue = value
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim();
    const newFilteredData = prevData.filter((item) => {
      const itemName = item.name
        ? item.name
            .toString()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .toLowerCase()
        : '';
      return itemName.includes(normalizedValue);
    });
    setData(newFilteredData);
  };

  const handleFilter = (event) => {
    const { value } = event.target;
    setFilterText(value);
    makeHandleFilter(value, event);
  };

  const handlePaste = () => {
    setData(prevData);
  };

  const handleSelect = () => {
    setSelection(true);
  };

  const csvURL = `${apiUrl}firms/list/?csvexport`;

  const fetchData = async () => {
    setLoading(true);
    try {
      const queryString = restFilter ? `/filter/?${restFilter}` : '';
      const response = await axios.get(`${apiUrl}firms/list${queryString}`);
      setData(response.data);
      setprevData(response.data);
      if (filterText.length > 0) {
        makeHandleFilter(filterText, { code: ' ' });
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleWrap = () => {
    const newValue = !isWrapped;
    setIsWrapped(newValue);
    setCookie('isWrapped', newValue ? '1' : '0', 1);
  };

  useEffect(() => {
    const saved = getCookie('isWrapped');
    if (saved !== null) {
      setIsWrapped(saved === '1');
    }
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.altKey && /^[a-zA-Z]$/.test(e.key)) {
        const targetRow = document.getElementById(`row-${e.key.toLowerCase()}`);
        if (targetRow) {
          targetRow.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    fetchData();
  }, [restFilter]);

  useEffect(() => {
    if (idFromURL && prevData.length > 0) {
      const firmIdNum = Number(idFromURL);
      if (!Number.isNaN(firmIdNum)) {
        setSelectedFirm(firmIdNum);
      }
    }
  }, [idFromURL, prevData]);

  useEffect(() => {
    setData(prevData);
    makeHandleFilter(filterText, { code: ' ' });
  }, [filterText, loading]);

  useEffect(() => {
    if (!firmName || prevData.length === 0) {
      return;
    }
    const q = decodeURIComponent(firmName).replace(/-/g, ' ');
    setFilterText(q);
    makeHandleFilter(q, { code: ' ' });
  }, [firmName, prevData]);

  const handleEditClick = (firmId, name) => {
    setSelectedFirmName(name);
    setSelectedFirm(Number(firmId));
  };

  const handleEditContactClick = (id, name) => {
    setSelectedFirmName(name);
    setSelectedContact(id);
  };

  const handleworkshoplistClick = (firmId, name) => {
    setSelectedFirmName(name);
    setSelectedWS(firmId);
  };

  const handleRestFilter = (RestData) => {
    const params = new URLSearchParams(RestData);
    setRestFilter(params);
    setRestData({ show_inactive: RestData.show_inactive });
  };

  const handleSaveContact = () => {
    fetchData();
  };

  const handleWS = () => {
    setSelectedWS(null);
  };

  const handleMeet = () => {
    setSelectedMeet(null);
  };

  const handlePractice = () => {
    setSelectedPractice(null);
  };

  const handleGift = () => {
    setSelectedGift(null);
  };

  const handleGiftlistClick = (id, name) => {
    setSelectedFirmName(name);
    setSelectedGift(id);
  };

  const handlePracticeListClick = (id) => {
    navigate(`/practiceListTable/${id}`);
  };

  const handleEditEventClick = (id) => {
    navigate(`/events/${id}`);
  };

  const handleEditMeetClick = (id, name) => {
    setSelectedFirmName(name);
    setSelectedMeet(id);
  };

  const deleteFirm = async (firmId) => {
    try {
      const response = await axios.delete(`${apiUrl}firms/${firmId}`);
      if (response.status === 200) {
        setData((prevFirm) => prevFirm.filter((firm) => firm.id !== firmId));
      } else {
        setError('Smazání kontaktu selhalo');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handledelClick = (firmId) => {
    const confirmed = window.confirm('Chceš to fakt vymazat?');
    if (confirmed) {
      deleteFirm(firmId);
    }
  };

  const handleClose = () => {
    setSelectedFirm(null);
  };

  const handleCloseContact = () => {
    setSelectedContact(null);
  };

  const handleCloseMeet = () => {
    setSelectedMeet(null);
  };

  const handleCloseWS = () => {
    setSelectedWS(null);
  };

  const handleCloseGift = () => {
    setSelectedGift(null);
  };

  const handleSave = () => {
    setSelectedFirm(null);
    fetchData();
  };

  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const sortByKey = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    const sortedData = [...data].sort((a, b) => {
      if (a[key] < b[key]) return direction === 'asc' ? -1 : 1;
      if (a[key] > b[key]) return direction === 'asc' ? 1 : -1;
      return 0;
    });
    setData(sortedData);
    setSortConfig({ key, direction });
  };

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return '';
    return sortConfig.direction === 'asc' ? '▲' : '▼';
  };

  const addFirmBnt = () => (
    <button type="button" className="add-firm-bnt" onClick={() => handleEditClick(-1)}>
      +
    </button>
  );

  const handleClearInput = () => {
    setFilterText('');
    setData(prevData);
  };

  const handleSaveAfterAddFirm = (FirmName) => {
    setFilterText(FirmName);
    fetchData();
    setData(prevData);
    setSelectedFirm(null);
    makeHandleFilter(FirmName, { code: ' ' });
  };

  if (loading) return <p className="no-data">Načítání...</p>;
  if (error) {
    return (
      <p className="no-data">
        Chyba: {error} <a href={`${url}`}>Přihlásit</a>
      </p>
    );
  }

  // Extrakce čistých datových sloupců z API
  const apiColumns = data.length !== 0 ? Object.keys(data[0]) : [];

  // --- Sestavení dynamické konfigurace pro naši Table komponentu ---
  const tableColumns = [
    {
      key: 'selection',
      label: (
        <>
          <span
            onClick={toggleWrap}
            style={{ cursor: 'pointer', fontSize: '1.2em', paddingLeft: '1em' }}
            title="Přepnout zalamování textu"
          >
            🔁
          </span>
          &nbsp;Vybrat
        </>
      ),
      render: (val, row, rowIndex) => (
        <input
          type="checkbox"
          checked={selectedIds.has(row.id)}
          onClick={(e) => toggleSelectWithShift(rowIndex, Number(row.id), e.shiftKey)}
          onChange={() => toggleSelectWithShift(rowIndex, row.id, false)}
        />
      ),
    },
    ...apiColumns.map((colKey) => ({
      key: colKey,
      label: colKey === 'name' ? `Firma ( ${data.length} )` : colKey,
      sortable: true,
      onCellClick: colKey === 'name' ? (row) => handleEditClick(row.id, row.name) : undefined,
      render: colKey === 'name' ? (val, row) => {
        const parts = row.name?.split(/\/\(kont\)/) ?? [];
        return (
          <>
            <span className={isWrapped ? 'wrap' : ''}>{parts[0]}</span>
            {parts[1] && <span className="col-contacts">{parts[1]}</span>}
          </>
        );
      } : undefined,
    })),
    {
      key: 'actions',
      label: (
        <div style={{ textAlign: 'left' }}>
          {addFirmBnt()}
          <a href={csvURL} id="csv_export">CSV export</a>
        </div>
      ),
      render: (val, row) => (
        <div className={isSmall ? 'small-resolution' : ''}>
          <button type="button" onClick={() => handleEditContactClick(row.id, row.name)}>Kontakty</button>
          <button type="button" onClick={() => handleEditMeetClick(row.id, row.name)} className="blue-btn">Schůzky</button>
          <button type="button" onClick={() => handleworkshoplistClick(row.id, row.name)}>Akce</button>
          <button type="button" onClick={() => handleEditEventClick(row.id, row.name)} className="green-btn">Událost</button>
          <button type="button" onClick={() => handleGiftlistClick(row.id, row.name)} className="orange-btn">Dary</button>
          <button type="button" onClick={() => handlePracticeListClick(row.id, row.name)} className="purple-btn">Praxe</button>
          {user.user !== 'reader' && (
            <button type="button" onClick={() => handledelClick(row.id)} className="del-btn">Smazat</button>
          )}
        </div>
      ),
    },
  ];

  return (
    <>
      <FutureEvents />
      {restFilter ? (
        <Filter setRestFilter={handleRestFilter} initFormData={Restdata} />
      ) : (
        <div className="filter-bar">
          <input
            type="text"
            name="name"
            className="search"
            placeholder="filtrovat dle názvu či kontaktu"
            tabIndex={0}
            value={filterText}
            onChange={handleFilter}
            onPaste={handlePaste}
            onSelect={handleSelect}
            onKeyDown={handleFilter}
          />
          <button type="button" onClick={() => setRestFilter(true)} className="filter-ex" />
          <button type="button" className="clear-input-filter-btn fn-btn" onClick={handleClearInput} style={{ cursor: 'pointer' }}>
            X
          </button>
        </div>
      )}

      {selectedGift && <GiftList firmId={selectedGift} onSave={handleGift} firmName={selectedFirmName} onClose={handleCloseGift} />}
      {selectedMeet && <MeetList firmId={selectedMeet} onSave={handleMeet} firmName={selectedFirmName} onClose={handleCloseMeet} />}
      {selectedWS ? <WorkshopList firmId={selectedWS} onSave={handleWS} firmName={selectedFirmName} onClose={handleCloseWS} /> : ''}
      {selectedContact && <ContactList firmId={selectedContact} onSave={handleSaveContact} firmName={getFirstPart(selectedFirmName)} onClose={handleCloseContact} />}

      {selectedFirm ? (
        <EditFirmForm firmId={selectedFirm} onSave={handleSave} handleSaveAfterAddFirm={handleSaveAfterAddFirm} onClose={handleClose} firmName={selectedFirmName} />
      ) : (
        <>
          <div className="selection-panel" style={{ display: 'flex', gap: '8px', alignItems: 'center', margin: '8px 0' }}>
            <button type="button" className="fn-btn" onClick={handlePasteToPage} disabled={selectedIds.size === 0} title="Vloží jména vybraných firem na stránku">
              Vložit výběr na stránku
            </button>
            <button type="button" className="fn-btn" onClick={handleClearSelection} disabled={selectedIds.size === 0 && selectionText.length === 0} title="Zruší výběr a vymaže výstup">
              Vymazat výběr
            </button>
            <span style={{ opacity: 0.7 }}>{selectedIds.size > 0 ? `Vybráno: ${selectedIds.size}` : 'Nevybráno nic'}</span>
          </div>

          {selectionText && (
            <div className="selection-output" style={{ margin: '8px 0' }}>
              <label id="selected-firms-label" htmlFor="selected-firms" style={{ display: 'block', marginBottom: 4 }}>Vybrané firmy (oddělené středníkem):</label>
              <textarea id="selected-firms" aria-labelledby="selected-firms-label" readOnly rows={3} style={{ width: '100%', resize: 'vertical' }} value={selectionText} />
            </div>
          )}

          <Table
            columns={tableColumns}
            data={data}
            className={`firmlist responsive-table ${isWrapped ? 'wrap-cells' : 'nowrap-cells'}`}
            caption={data.length === 0 ? undefined : <caption>{data.length} záznamů</caption>}
            rowIdPattern={(row) => `row-${row.name?.charAt(0).toLowerCase()}`}
            sortConfig={sortConfig}
            onSort={sortByKey}
            getSortIcon={getSortIcon}
          />

          <div className="selection-panel" style={{ display: 'flex', gap: '8px', alignItems: 'center', padding: '10px', position: 'fixed', bottom: 0, background: 'white' }}>
            <button type="button" className="blue-btn" onClick={handlePasteToPage} disabled={selectedIds.size === 0} title="Zkopírovat do schránky">
              Vložit výběr na stránku & kopírovat
            </button>
            <button type="button" className="red-btn" onClick={handleClearSelection} disabled={selectedIds.size === 0 && selectionText.length === 0} title="Zruší výběr a vymaže výstup">
              Vymazat výběr
            </button>
            <span>{selectedIds.size > 0 ? `Vybráno: ${selectedIds.size}` : 'Nevybráno nic'}</span>
            {copied && <Notification message="Zkopírováno do schránky ✓" type="edit-firm-success" />}
          </div>
        </>
      )}
    </>
  );
};

export default FirmList;