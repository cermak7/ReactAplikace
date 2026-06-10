/* eslint-disable jsx-a11y/control-has-associated-label */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-static-element-interactions */
import axios from 'axios';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUrl } from './UrlProvider';
import isSmall from '../utils/mobileDetect';
import Table from './Table';

const getFirstPart = (text) => {
  const parts = text?.split(/\/\(kont\)/) || [];
  return parts[0];
};

const CampaignList = () => {
  const [campaigns, setCampaigns] = useState([]);
  const { apiUrl, user } = useUrl();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const [isWrapped, setIsWrapped] = useState(false);

  const toggleWrap = () => {
    setIsWrapped(!isWrapped);
  };

  useEffect(() => {
    const fetchContacts = async () => {
      try {
        const response = await axios.get(`${apiUrl}/campaigns/`);
        if (Array.isArray(response.data) && response.data.length === 0
          && response.data.msg !== undefined) {
          setError('Žádné kontakty.');
        } else {
          setCampaigns(response.data);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchContacts();
  }, [apiUrl]);

  const handleEditClick = (campaign) => {
    navigate(`/campaignAdd/${campaign.id}`);
  };

  const deleteCampaign = async (firmId) => {
    try {
      const response = await axios.delete(`${apiUrl}campaign/${firmId}`);
      if (response.status === 200) {
        setCampaigns((prevFirm) => prevFirm.filter((firm) => firm.id !== firmId));
      } else {
        setError('Smazání kontaktu selhalo');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelClick = (id) => {
    const confirmed = window.confirm('Chceš to fakt vymazat?');
    if (confirmed) {
      deleteCampaign(id);
    }
  };

  const handleClick = (id) => {
    navigate(`/getCampaignContacts/${id}`);
  };

  if (loading) {
    return <p className="no-data">Načítám...</p>;
  }
  if (error) {
    return <p className="no-data">Error: {error}</p>;
  }

  // Definice struktury a chování sloupců pro novou komponentu Table
  const tableColumns = [
    {
      key: 'id',
      label: (
        <>
          ID{' '}
          <span
            onClick={(e) => {
              e.stopPropagation(); // Zabránit prokliknutí řádku při přepínání wrapu
              toggleWrap();
            }}
            style={{ cursor: 'pointer', fontSize: '1.2em', paddingLeft: '1em' }}
            title="Přepnout zalamování textu"
          >
            🔁
          </span>
        </>
      ),
    },
    {
      key: 'name',
      label: 'Název',
      onCellClick: (row) => handleClick(row.id),
      render: (val) => getFirstPart(val),
    },
    { key: 'created_date', label: 'Datum Vytvoření' },
    { key: 'sent_date_time', label: 'Datum odeslání' },
    { key: 'end_date', label: 'Datum ukončení' },
    { key: 'recipient_count', label: 'Počet adresátů (firem)' },
    { key: 'undelivered_count', label: 'Počet nedoručení' },
    { key: 'confirmed_received_count', label: 'Počet potvrzení o doručení' },
    { key: 'replied_count', label: 'Odpovědělo' },
    { key: 'note', label: 'Poznámka' },
    {
      key: 'actions',
      label: '',
      render: (val, campaign) => {
        if (user.user === 'reader') return null;
        return (
          <div className={isSmall() ? 'small-resolution' : ''}>
            <button type="button" onClick={() => handleEditClick(campaign)}>upravit</button>
            <button type="button" onClick={() => handleDelClick(campaign.id)} className="del-btn">smazat</button>
            <a href={`${apiUrl}campaignExport/${campaign.id}/?csvexport`} id="csv_export">CSV export</a>
          </div>
        );
      },
    },
  ];

  return (
    <div>
      <h1>Zasílání</h1>
      <Table
        columns={tableColumns}
        data={campaigns}
        className={`responsive-table ${isWrapped ? 'wrap-cells' : 'nowrap-cells'}`}
      />
    </div>
  );
};

export default CampaignList;