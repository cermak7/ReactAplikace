/* eslint-disable jsx-a11y/control-has-associated-label */
import axios from 'react';
import React, { useEffect, useState } from 'react';
import { useUrl } from './UrlProvider';
import Table from './Table';

const AllWSlist = () => {
  const [data, setData] = useState([]);
  const [prevData, setprevData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { url, apiUrl } = useUrl();
  const [filterText, setFilterText] = useState('');

  const csvURL = `${apiUrl}stats/getAllWSs/?csvexport`;

  const fetchData = async () => {
    try {
      const response = await axios.get(`${apiUrl}stats/getAllWSs`);
      setData(response.data);
      setprevData(response.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleFilter = (event) => {
    const { value } = event.target;
    setFilterText(value);

    if (value.length === 0 || event.code === 'Backspace') {
      setData(prevData);
    } else {
      const normalizedValue = value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
      const newFilteredData = prevData.filter((item) => {
        const itemName = item.name ? item.name.toString().normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase() : '';
        return itemName.includes(normalizedValue);
      });
      setData(newFilteredData);
    }
  };

  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  const sortByKey = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    const sortedData = [...prevData].sort((a, b) => {
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

  if (loading) return <p>Načítání...</p>;

  if (error) {
    return (
      <p>
        Chyba:&nbsp;{error} <a href={`${url}`}>Přihlásit</a>
      </p>
    );
  }

  const apiColumns = prevData.length !== 0 ? Object.keys(prevData[0]) : [];

  const tableColumns = [
    ...apiColumns.map((colKey) => ({
      key: colKey,
      label: colKey === 'name' ? `Firma (${data.length})` : colKey.replace(/_/g, ' '),
      sortable: true,
      className: sortConfig.key === colKey ? 'sorted-colm' : '',
    })),
    {
      key: 'csv_export_col',
      label: <a href={csvURL}>CSV export</a>,
      render: () => null, // Prázdná buňka v řádku pro správné HTML zarovnání sloupců
    },
  ];

  return (
    <>
      <div className="filter-bar">
        <input
          type="text"
          name="name"
          className="search"
          placeholder="vyhledávání"
          value={filterText}
          onChange={handleFilter}
          onKeyDown={handleFilter}
        />
      </div>

      {data.length === 0 ? (
        <p>Žádná data.</p>
      ) : (
        <Table
          columns={tableColumns}
          data={data}
          className="firmlist statlist"
          sortConfig={sortConfig}
          onSort={sortByKey}
          getSortIcon={getSortIcon}
        />
      )}
    </>
  );
};

export default AllWSlist;