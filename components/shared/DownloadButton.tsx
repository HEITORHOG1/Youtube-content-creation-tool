import React from 'react';

interface DownloadButtonProps {
    data: string;
    filename: string;
    contentType: 'text/plain' | 'image/jpeg' | 'audio/mpeg';
    isBase64?: boolean;
}

const DownloadButton: React.FC<DownloadButtonProps> = ({ data, filename, contentType, isBase64 = false }) => {
    const handleDownload = () => {
        const link = document.createElement('a');
        let href = '';

        if (isBase64) {
            href = `data:${contentType};base64,${data}`;
        } else {
            const blob = new Blob([data], { type: contentType });
            href = URL.createObjectURL(blob);
        }
        
        link.href = href;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        
        // Clean up
        document.body.removeChild(link);
        if (!isBase64) {
            URL.revokeObjectURL(href);
        }
    };

    return (
        <button onClick={handleDownload} className="text-blue-600 hover:text-blue-800 transition-colors duration-200 p-1 rounded-full hover:bg-blue-100" aria-label={`Download ${filename}`}>
             <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
        </button>
    );
};

export default DownloadButton;