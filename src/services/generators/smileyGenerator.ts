import { RatingSize } from '../../types/ratings';
import { iconService } from '../iconService';
import { getRatingSizeConfig } from '../../utils/ratingStyles';

interface Labels {
  satisfied?: string;
  neutral?: string;
  unsatisfied?: string;
}

export async function generateSmileyRating(
  baseUrl: string, 
  code: string, 
  size: RatingSize,
  labels?: Labels
): Promise<string> {
  try {
    const icons = await iconService.getSmileyIcons();
    if (!icons.length) {
      throw new Error('Smiley icons not found');
    }

    const sizeConfig = getRatingSizeConfig(size);
    const orderedValues = [5, 3, 1];
    
    const getLabel = (value: number): string => {
      if (!labels) return '';
      if (value === 5) return labels.satisfied || '';
      if (value === 3) return labels.neutral || '';
      if (value === 1) return labels.unsatisfied || '';
      return '';
    };

    const buttons = orderedValues
      .map(value => {
        const icon = icons.find(i => i.value === value);
        if (!icon) return '';

        const url = new URL(`rate/${code}`, baseUrl);
        url.searchParams.set('type', 'smileys');
        url.searchParams.set('value', value.toString());
        
        const label = getLabel(value);
        const showLabel = label !== '';

        return `
          <td style="padding:0 ${sizeConfig.spacing} 0 0; text-align:center; vertical-align:middle;">
            <a href="${url.toString()}" style="text-decoration:none; display:inline-block;">
              <img 
                src="${icon.url}" 
                alt="${label}" 
                title="${label}"
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
      })
      .join('');

    return `
      <table cellspacing="0" cellpadding="0" border="0" style="display:inline-table;">
        <tr>
          ${buttons}
        </tr>
      </table>
    `;
  } catch (error) {
    console.error('Failed to generate smiley rating:', error);
    return '';
  }
}