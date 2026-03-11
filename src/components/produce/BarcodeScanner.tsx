'use client';

import { useEffect, useRef, useState } from 'react';
import { BrowserMultiFormatReader, IScannerControls } from '@zxing/browser';
import { Result } from '@zxing/library';
import { Button } from 'react-bootstrap';
import styles from '../../styles/barcode-scanner.module.css';

interface BarcodeScannerProps {
  onDetected: (code: string) => void;
  onClose: () => void;
  onManualAdd: () => void;
}

const BarcodeScanner = ({
  onDetected,
  onClose,
  onManualAdd,
}: BarcodeScannerProps) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const reader = new BrowserMultiFormatReader();
    let isMounted = true;
    let scannerControls: IScannerControls | null = null;
    let scanResolved = false;

    const startScan = async () => {
      try {
        const devices = await BrowserMultiFormatReader.listVideoInputDevices();
        if (!devices.length) {
          throw new Error('No camera found. Please use Manual Add.');
        }

        const firstDeviceId = devices[0].deviceId;

        scannerControls = await reader.decodeFromVideoDevice(
          firstDeviceId,
          videoRef.current!,
          (result: Result | undefined) => {
            if (result && isMounted) {
              try {
                scanResolved = true;
                onDetected(result.getText());
                scannerControls?.stop();
                onClose();
              } catch {
                const message = 'Could not process scan result. Please use Manual Add.';
                setError(message);
                scanResolved = true;
              }
            }
          },
        );

        setLoading(false);
      } catch (err: any) {
        const message = err?.message || 'Error accessing camera. Please use Manual Add.';
        setError(message);
        setLoading(false);
        scanResolved = true;
      }
    };

    startScan();

    const noResultTimer = setTimeout(() => {
      if (!isMounted || scanResolved) return;
      const message = 'Still having trouble reading this barcode. Try Manual Add.';
      setError(message);
      scanResolved = true;
    }, 15000);

    return () => {
      isMounted = false;
      clearTimeout(noResultTimer);
      scannerControls?.stop();
    };
  }, [onDetected, onClose]);

  const handleManualAdd = () => {
    onManualAdd();
    onClose();
  };

  return (
    <div className={styles.container}>
      <h5>Scan a Barcode</h5>
      {error && <p className={styles.errorText}>{error}</p>}
      {loading && <p>Initializing camera...</p>}

      {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
      <video ref={videoRef} className={styles.video} />

      <Button onClick={onClose} className={styles.closeButton}>
        Close
      </Button>

      {error && (
        <Button variant="warning" className="mt-2" onClick={handleManualAdd}>
          Manual Add
        </Button>
      )}
    </div>
  );
};

export default BarcodeScanner;
