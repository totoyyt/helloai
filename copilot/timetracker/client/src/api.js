const API_URL = 'http://localhost:3001/api/data';

export const fetchData = async () => {
    const response = await fetch(API_URL);
    if (!response.ok) throw new Error('Failed to fetch data');
    return response.json();
};

export const saveData = async (data) => {
    const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to save data');
    return response.json();
};
