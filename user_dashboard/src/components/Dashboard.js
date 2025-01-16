import { useState, useEffect } from "react";
import axios from "axios";
import PropTypes from "prop-types";
import { gapi } from "gapi-script";

const Dashboard = ({ user }) => {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const SHEET_ID = ""; 
  const API_KEY = "";
  const CLIENT_ID = ""; 
  const SCOPES = "https://www.googleapis.com/auth/spreadsheets https://www.googleapis.com/auth/drive";

  // Fetch data from Google Sheets
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get(
          `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/user_mock_data?key=${API_KEY}`
        );

        const rows = response.data.values;
        if (!rows || rows.length === 0) {
          setData([]);
          setFilteredData([]);
          return;
        }

        const headers = rows.shift();
        const formattedData = rows.map((row) =>
          headers.reduce((obj, header, index) => {
            obj[header] = row[index] || "";
            return obj;
          }, {})
        );
        setData(formattedData);
        setFilteredData(formattedData);
      } catch (err) {
        setError("Error fetching data from Google Sheets");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [SHEET_ID, API_KEY]);

  // Initialize Google API client
  useEffect(() => {
    gapi.load("client:auth2", () => {
      gapi.client
        .init({
          apiKey: API_KEY,
          clientId: CLIENT_ID,
          scope: SCOPES,
          discoveryDocs: [
            "https://sheets.googleapis.com/$discovery/rest?version=v4",
          ],
        })
        .then(() => console.log("Google API client initialized"))
        .catch((err) => console.error("Error initializing Google API client", err));
    });
  }, [API_KEY, CLIENT_ID, SCOPES]);

  const handleSearch = (e) => {
    const value = e.target.value.toLowerCase();
    setSearchTerm(value);
    const filtered = data.filter((row) =>
      Object.values(row).some((val) =>
        val.toString().toLowerCase().includes(value)
      )
    );
    setFilteredData(filtered);
  };

  const handleSort = (key) => {
    const sorted = [...filteredData].sort((a, b) =>
      a[key]?.localeCompare(b[key] || "")
    );
    setFilteredData(sorted);
  };

  const exportToNewGoogleSheet = () => {
    if (filteredData.length === 0) {
      alert("No data to export!");
      return;
    }
  
    // สร้าง Google Sheets ใหม่
    const createSpreadsheet = () => {
      const spreadsheet = {
        properties: {
          title: "Filtered Data Sheet", // ชื่อของ Google Sheet ใหม่
        },
        sheets: [
          {
            properties: {
              title: "user_mock_data", // ชื่อของแท็บใน Google Sheet
            },
          },
        ],
      };

      gapi.client.sheets.spreadsheets.create({}, spreadsheet).then((response) => {
        const newSheetId = response.result.spreadsheetId;
        const newSheetUrl = `https://docs.google.com/spreadsheets/d/${newSheetId}`; // สร้างลิงก์ไปยัง Google Sheet ใหม่
        console.log("Created new spreadsheet with ID:", newSheetId);
        writeDataToNewSheet(newSheetId, newSheetUrl);
      });
    };
  
    // ฟังก์ชันที่ใช้เขียนข้อมูลลงใน Google Sheet ใหม่
    const writeDataToNewSheet = (spreadsheetId, sheetUrl) => {
      const range = "user_mock_data"; // ช่วงใน Google Sheet ที่ต้องการเขียนข้อมูล
      const values = [
        Object.keys(filteredData[0]), // หัวตาราง
        ...filteredData.map((row) => Object.values(row)), // ข้อมูลที่กรองแล้ว
      ];
  
      const body = {
        values,
      };
  
      gapi.client.sheets.spreadsheets.values.update({
        spreadsheetId,
        range,
        valueInputOption: "RAW", // หรือ "USER_ENTERED" ถ้าต้องการให้ Google Sheets ใช้สูตรหรือการแปลงข้อมูล
        resource: body,
      })
      .then((response) => {
        console.log("Data exported to new Google Sheet:", response);
        alert("Data exported successfully to the new Google Sheet!");
  
        alert(`Google Sheet created successfully! You can view it here: ${sheetUrl}`);
      })
      .catch((error) => {
        console.error("Error exporting data:", error);
        alert("Error exporting data!");
      });
    };
  
    createSpreadsheet();
  };
  
  return (
          <div className="p-6 bg-gray-100 min-h-screen">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">User List Dashboard</h2>
        <p className="text-gray-700 mb-6">Welcome, {user.name}</p>

        {isLoading && <p className="text-blue-500">Loading data...</p>}
        {error && <p className="text-red-500 font-medium">{error}</p>}

        <input
          type="text"
          placeholder="Search..."
          value={searchTerm}
          onChange={handleSearch}
          className="block w-full max-w-md p-2 mb-4 border border-gray-300 rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        
        <table className="table-auto w-full border-collapse bg-white shadow-lg rounded">
          <thead className="bg-blue-500 text-white">
            <tr>
              {Object.keys(data[0] || {}).map((key) => (
                <th
                  key={key}
                  onClick={() => handleSort(key)}
                  className="px-4 py-2 cursor-pointer hover:bg-blue-600"
                >
                  {key}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredData.map((row, index) => (
              <tr
                key={index}
                className={`${index % 2 === 0 ? 'bg-gray-100' : 'bg-white'}`}
              >
                {Object.values(row).map((value, idx) => (
                  <td key={idx} className="border px-4 py-2 text-gray-700">
                    {value}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>

        <button
            onClick={exportToNewGoogleSheet}
            className="mt-6 px-6 py-2 bg-blue-500 text-white font-semibold rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
          >
            Export Filtered Data to New Google Sheet
          </button>
      </div>
  )
};

Dashboard.propTypes = {
  user: PropTypes.object.isRequired,
};

export default Dashboard;
