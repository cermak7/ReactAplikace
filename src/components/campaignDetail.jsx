import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import Table from './Table'; 

const CampaignDetail = () => {
  const { id } = useParams();
  const [campaign, setCampaign] = useState(null);

  useEffect(() => {
    axios.get(`/api/campaigns/${id}`)
      .then(response => setCampaign(response.data))
      .catch(error => console.error('Error fetching campaign:', error));
  }, [id]);

  if (!campaign) return <div>Načítání...</div>;

  const detailData = [
    { metrika: 'Datum vytvoření', hodnota: campaign.created_date || '—' },
    { metrika: 'Datum odeslání', hodnota: campaign.sent_date_time || '—' },
    { metrika: 'Počet příjemců', hodnota: campaign.recipient_count ?? 0 },
    { metrika: 'Nedoručeno', hodnota: campaign.undelivered_count ?? 0 },
    { metrika: 'Potvrzeno přijetí', hodnota: campaign.confirmed_received_count ?? 0 },
    { metrika: 'Odpovězeno', hodnota: campaign.replied_count ?? 0 },
    { metrika: 'Poznámka', hodnota: campaign.note || '—' },
  ];

  const tableColumns = [
    { key: 'metrika', label: 'Sledovaný údaj', headerStyle: { width: '250px', textAlign: 'left' } },
    { key: 'hodnota', label: 'Hodnota', className: 'detail-value' },
  ];

  return (
    <div className="campaign-detail-container" style={{ padding: '20px' }}>
      <h1>{campaign.name}</h1>
      
      <Table
        columns={tableColumns}
        data={detailData}
        className="responsive-table detail-table"
      />
    </div>
  );
};

export default CampaignDetail;