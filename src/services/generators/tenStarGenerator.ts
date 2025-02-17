import { RatingSize } from '../../types/ratings';
import { translations } from '../../utils/translations';
import { iconService } from '../iconService';
import { getRatingSizeConfig } from '../../utils/ratingStyles';
import { extractTopdeskTicketInfo } from '../../utils/topdesk';

interface Labels {
  poor?: string;
  excellent?: string;
}

export async function generateTenStarRating(
  baseUrl: string, 
  code: string, 
  size: RatingSize,
  labels?: Labels
): Promise<string> {
  try {
    const iconUrl = await iconService.getStarIconUrl();
    if (!iconUrl) {
      throw new Error('Star icon not found');
    }

    const sizeConfig = getRatingSizeConfig(size);
    
    const getLabel = (value: number): string => {
      if (!labels) return '';
      if (value === 1) return labels.poor || '';
      if (value === 10) return labels.excellent || '';
      return '';
    };
    
    const stars = Array.from({ length: 10 }, (_, i) => i + 1)
    .map(value => {
      const url = new URL(`rate/${code}`, baseUrl);
      url.searchParams.set('type', 'ten_stars');
      url.searchParams.set('value', value.toString());
      
      const label = getLabel(value);
      const showLabel = label !== '';
      
      return `
        <td style="padding:0 ${sizeConfig.spacing} 0 0; text-align:center; vertical-align:middle;">
          <a href="${url.toString()}" style="text-decoration:none; display:inline-block;">
            <img 
              src="${iconUrl}" 
              alt="${value} stars" 
              title="${value} ${value === 1 ? translations.star : translations.stars}"
              style="width:${sizeConfig.starSize}; height:${sizeConfig.starSize}; opacity:0.5; border:0;" 
            />
          </a>
          ${showLabel ? `
            <div style="font-size:12px; color:#666; margin-top:4px;">
              ${label}
            </div>
          ` : ''}
        </td>
      `;
    }).join('');
    
    return `
      <table cellspacing="0" cellpadding="0" border="0" style="display:inline-table;">
        <tr>
          ${stars}
        </tr>
      </table>
    `;
  } catch (error) {
    console.error('Failed to generate ten star rating:', error);
    return '';
  }
}