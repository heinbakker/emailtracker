import { RatingType, RatingSize } from '../types/ratings';
import { getRatingSizeConfig } from '../utils/ratingStyles';
import { translations } from '../utils/translations';

interface Labels {
  // Star labels
  poor?: string;
  excellent?: string;
  // Custom labels
  positive?: string;
  negative?: string;
  neutral?: string;
  // Smiley labels
  satisfied?: string;
  unsatisfied?: string;
}

export async function generateButtonCode(
  type: RatingType,
  code: string,
  size: RatingSize = 'md',
  labels?: Labels
): Promise<string> {
  try {
    const baseUrl = import.meta.env.VITE_APP_URL;
    if (!baseUrl) {
      throw new Error('Application URL not configured');
    }

    const sizeConfig = getRatingSizeConfig(size);
    let content = '';

    switch (type) {
      case 'stars':
      case 'ten_stars': {
        const count = type === 'stars' ? 5 : 10;
        const showLabels = labels?.poor || labels?.excellent;
        const tableStyle = `
          border-collapse: separate;
          border-spacing: 0;
          -webkit-user-select: all;
          user-select: all;
          cursor: copy;
        `.trim();

        // Generate star cells
        const starCells = Array.from({ length: count }, (_, i) => {
          const value = i + 1;
          const url = new URL(`rate/${code}`, baseUrl);
          url.searchParams.set('type', type);
          url.searchParams.set('value', value.toString());
          
          const label = `${value} ${value === 1 ? translations.star : translations.stars}`;
          
          return `
            <td style="padding:0 ${sizeConfig.spacing} 0 0; text-align:center; vertical-align:middle;">
              <a href="${url.toString()}" style="text-decoration:none; display:inline-block; pointer-events:none;">
                <img
                  src="https://fymlzuznucklhjckxehs.supabase.co/storage/v1/object/public/icons/stars/star.png" 
                  alt="${label}" 
                  title="${label}"
                  style="width:${sizeConfig.starSize}; height:${sizeConfig.starSize}; opacity:0.5; border:0; pointer-events:none;"
                />
              </a>
            </td>
          `;
        }).join('');

        // Generate label cells
        const labelCells = Array.from({ length: count }, (_, i) => {
          const value = i + 1;
          const displayLabel = value === 1 ? labels?.poor : 
                             value === count ? labels?.excellent : 
                             '';
          
          return `
            <td style="padding:0 ${sizeConfig.spacing} 0 0; text-align:center;">
              ${displayLabel ? `
                <div style="font-size:12px; color:#666; white-space:nowrap;">
                  ${displayLabel}
                </div>
              ` : ''}
            </td>
          `;
        }).join('');

        content = `
          <table cellspacing="0" cellpadding="0" style="${tableStyle}">
            <tr>${starCells}</tr>
            ${showLabels ? `<tr>${labelCells}</tr>` : ''}
          </table>
        `;
        break;
      }

      case 'smileys': {
        const tableStyle = `
          border-collapse: separate;
          border-spacing: 0;
          -webkit-user-select: all;
          user-select: all;
          cursor: copy;
        `.trim();

        const options = [
          { value: 5, url: 'https://fymlzuznucklhjckxehs.supabase.co/storage/v1/object/public/icons/smileys/happy', label: labels?.satisfied || translations.satisfied },
          { value: 3, url: 'https://fymlzuznucklhjckxehs.supabase.co/storage/v1/object/public/icons/smileys/neutral', label: labels?.neutral || translations.neutral },
          { value: 1, url: 'https://fymlzuznucklhjckxehs.supabase.co/storage/v1/object/public/icons/smileys/sad', label: labels?.unsatisfied || translations.unsatisfied }
        ];

        // Generate smiley cells
        const smileyCells = options.map(({ value, url, label }) => {
          const rateUrl = new URL(`rate/${code}`, baseUrl);
          rateUrl.searchParams.set('type', 'smileys');
          rateUrl.searchParams.set('value', value.toString());
          
          return `
            <td style="padding:0 ${sizeConfig.spacing} 0 0; text-align:center; vertical-align:middle;">
              <a href="${rateUrl.toString()}" style="text-decoration:none; display:inline-block; pointer-events:none;">
                <img 
                  src="${url}" 
                  alt="${label}" 
                  title="${label}"
                  style="width:${sizeConfig.starSize}; height:${sizeConfig.starSize}; opacity:0.5; border:0; pointer-events:none;"
                />
              </a>
            </td>
          `;
        }).join('');

        // Generate label cells
        const labelCells = options.map(({ label }) => `
          <td style="padding:0 ${sizeConfig.spacing} 0 0; text-align:center;">
            <div style="font-size:12px; color:#666; white-space:nowrap;">
              ${label}
            </div>
          </td>
        `).join('');

        content = `
          <table cellspacing="0" cellpadding="0" style="${tableStyle}">
            <tr>${smileyCells}</tr>
            <tr>${labelCells}</tr>
          </table>
        `;
        break;
      }

      case 'custom': {
        const tableStyle = `
          border-collapse: separate;
          border-spacing: 0;
          -webkit-user-select: all;
          user-select: all;
          cursor: copy;
        `.trim();

        const options = [
          { value: 5, url: 'https://fymlzuznucklhjckxehs.supabase.co/storage/v1/object/public/icons/custom/excellent.png', label: labels?.excellent },
          { value: 4, url: 'https://fymlzuznucklhjckxehs.supabase.co/storage/v1/object/public/icons/custom/positive.png', label: labels?.positive },
          { value: 3, url: 'https://fymlzuznucklhjckxehs.supabase.co/storage/v1/object/public/icons/custom/neutral-face.png', label: labels?.neutral },
          { value: 1, url: 'https://fymlzuznucklhjckxehs.supabase.co/storage/v1/object/public/icons/custom/negative.png', label: labels?.negative }
        ];

        // Generate icon cells
        const iconCells = options.map(({ value, url: iconUrl, label }) => {
          const rateUrl = new URL(`rate/${code}`, baseUrl);
          rateUrl.searchParams.set('type', 'custom');
          rateUrl.searchParams.set('value', value.toString());
          
          return `
            <td style="padding:0 ${sizeConfig.spacing} 0 0; text-align:center; vertical-align:middle;">
              <a href="${rateUrl.toString()}" style="text-decoration:none; display:inline-block; pointer-events:none;">
                <img 
                  src="${iconUrl}" 
                  alt="${label || ''}"
                  title="${label || ''}"
                  style="width:${sizeConfig.starSize}; height:${sizeConfig.starSize}; opacity:0.5; border:0; pointer-events:none;"
                />
              </a>
            </td>
          `;
        }).join('');

        // Generate label cells
        const labelCells = options.map(({ label }) => {
          if (!label) return `<td style="padding:0 ${sizeConfig.spacing} 0 0;"></td>`;
          return `
            <td style="padding:0 ${sizeConfig.spacing} 0 0; text-align:center;">
              <div style="font-size:12px; color:#666; white-space:nowrap;">
                ${label}
              </div>
            </td>
          `;
        }).join('');

        const showLabels = options.some(opt => opt.label);

        content = `
          <table cellspacing="0" cellpadding="0" style="${tableStyle}">
            <tr>${iconCells}</tr>
            ${showLabels ? `<tr>${labelCells}</tr>` : ''}
          </table>
        `;
        break;
      }
    }

    return content.trim();
  } catch (error) {
    console.error('Failed to generate button code:', error);
    return '';
  }
}