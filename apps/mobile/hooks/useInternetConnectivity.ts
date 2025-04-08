import {useState, useEffect} from 'react';

export const useInternetConnectivity = () => {
  const [isConnected, setIsConnected] = useState<boolean>(true);

  useEffect(() => {
    const checkConnectivity = async () => {
      try {
        const response = await fetch('https://google.com');
        if (response.status === 200) return setIsConnected(true);
        setIsConnected(false);
      } catch (error) {
        console.log(error);
      }
    };

    checkConnectivity();
  }, []);

  return {isConnected};
};
