/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

const emailForm = document.getElementById('email-form') as HTMLFormElement;
const generateBtn = document.getElementById('generate-btn') as HTMLButtonElement;
const btnText = document.querySelector('#generate-btn .btn-text') as HTMLElement;
const spinner = document.querySelector('#generate-btn .spinner') as HTMLElement;
const outputContainer = document.getElementById(
  'output-container'
) as HTMLElement;
const outputPlaceholder = document.getElementById(
  'output-placeholder'
) as HTMLElement;
const previewPane = document.getElementById('preview-pane') as HTMLIFrameElement;
const codeBlock = document.getElementById('code-block') as HTMLElement;
const copyBtn = document.getElementById('copy-btn') as HTMLButtonElement;
const addOfferBtn = document.getElementById('add-offer-btn') as HTMLButtonElement;
const emailBodyTextarea = document.getElementById('email-body') as HTMLTextAreaElement;

const setLoading = (isLoading: boolean) => {
  if (isLoading) {
    generateBtn.disabled = true;
    btnText.style.display = 'none';
    spinner.style.display = 'block';
  } else {
    generateBtn.disabled = false;
    btnText.style.display = 'block';
    spinner.style.display = 'none';
  }
};

const readFileAsDataURL = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
};

const getContrastColor = (hexColor: string): string => {
  if (!hexColor) return '#333333'; // default dark text
  const hex = hexColor.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  // http://www.w3.org/TR/AERT#color-contrast
  const brightness = ((r * 299) + (g * 587) + (b * 114)) / 1000;
  return (brightness > 125) ? '#333333' : '#ffffff';
};


const generateEmailHtml = (data: any) => {
  const {
    subject,
    bodyContent,
    heroImage,
    ctaText,
    ctaLink,
    ctaColor,
    offers,
    disclaimer,
    bodyBackgroundColor,
  } = data;
  const mainButtonColor = ctaColor || '#4f46e5';
  const mainBodyBg = bodyBackgroundColor || '#ffffff';
  const mainBodyTextColor = getContrastColor(mainBodyBg);

  const renderOffer = (offer: any) => {
    if (!offer.title && !offer.vehicle && !offer.details) return '';
    const imageCell = offer.imageDataUrl
      ? `<td width="120" valign="top" style="padding-right: 20px;">
           <img src="${offer.imageDataUrl}" width="120" alt="${offer.title}" style="display: block; width: 100%; max-width: 120px; border: 0; border-radius: 8px;">
         </td>`
      : '';
    const offerButtonColor = offer.ctaColor || '#4f46e5';

    return `
      <tr>
        <td style="padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px; background-color: #ffffff;">
          <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
            <tr>
              ${imageCell}
              <td valign="top" style="font-family: Arial, sans-serif; color: #333333;">
                <h3 style="margin: 0 0 5px 0; font-size: 16px; font-weight: bold; color: #4a5568;">${offer.vehicle || ''}</h3>
                <h2 style="margin: 0 0 10px 0; font-size: 20px; font-weight: bold; color: #1a202c;">${offer.title || ''}</h2>
                <p style="margin: 0 0 15px 0; font-size: 14px; line-height: 1.6;">${offer.details.replace(/\n/g, '<br />') || ''}</p>
                ${ offer.ctaText && offer.ctaLink ? `
                  <div><!--[if mso]>
                    <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="${offer.ctaLink}" style="height:40px;v-text-anchor:middle;width:150px;" arcsize="13%" strokecolor="${offerButtonColor}" fillcolor="${offerButtonColor}">
                      <w:anchorlock/>
                      <center style="color:#ffffff;font-family:sans-serif;font-size:14px;font-weight:bold;">${offer.ctaText}</center>
                    </v:roundrect>
                  <![endif]--><a href="${offer.ctaLink}"
                  style="background-color:${offerButtonColor};border-radius:5px;color:#ffffff;display:inline-block;font-family:sans-serif;font-size:14px;font-weight:bold;line-height:40px;text-align:center;text-decoration:none;width:150px;-webkit-text-size-adjust:none;mso-hide:all;">${offer.ctaText}</a></div>` : ''
                }
                ${ offer.disclaimer ? `<p style="margin: 15px 0 0 0; font-size: 11px; color: #718096; line-height: 1.5;">${offer.disclaimer.replace(/\n/g, '<br />')}</p>` : '' }
              </td>
            </tr>
          </table>
        </td>
      </tr>
      <tr><td style="font-size: 20px; line-height: 20px;">&nbsp;</td></tr>`;
  };

  const offersHtml = offers.map(renderOffer).join('');

  return `
  <!DOCTYPE html>
  <html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
  <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width">
      <meta http-equiv="X-UA-Compatible" content="IE=edge">
      <meta name="x-apple-disable-message-reformatting">
      <title>${subject}</title>
      <!--[if mso]>
          <style>
              * {
                  font-family: sans-serif !important;
              }
          </style>
      <![endif]-->
      <style>
          html, body {
              margin: 0 auto !important;
              padding: 0 !important;
              height: 100% !important;
              width: 100% !important;
              background: #f1f3f5;
          }
          * { -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; }
          table, td { mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important; }
          img { -ms-interpolation-mode:bicubic; }
          a { text-decoration: none; }
          @media screen and (max-width: 600px) {
              .email-container {
                  width: 100% !important;
                  margin: auto !important;
              }
          }
      </style>
  </head>
  <body width="100%" style="margin: 0; padding: 0 !important; mso-line-height-rule: exactly; background-color: #f1f3f5;">
      <center style="width: 100%; background-color: #f1f3f5;">
          <div style="max-width: 600px; margin: 0 auto;" class="email-container">
              <!--[if mso]>
              <table align="center" role="presentation" cellspacing="0" cellpadding="0" border="0" width="600">
              <tr>
              <td>
              <![endif]-->
              <table align="center" role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin: auto;">
                  <tr>
                      <td style="padding: 20px; font-family: Arial, sans-serif; font-size: 15px; line-height: 1.5; color: #333333;">
                        ${ heroImage ? `
                          <tr>
                            <td>
                              <img src="${heroImage}" alt="Hero Image" width="600" style="width: 100%; max-width: 600px; height: auto; margin: auto; display: block; border-radius: 8px;">
                            </td>
                          </tr>
                          <tr><td style="font-size: 20px; line-height: 20px;">&nbsp;</td></tr>
                          ` : ''
                        }
                          <tr>
                              <td style="padding: 10px 20px; background-color: ${mainBodyBg}; border-radius: 8px;">
                                  <p style="margin: 0; color: ${mainBodyTextColor};">${bodyContent.replace(/\n/g, '<br />')}</p>
                              </td>
                          </tr>
                          <tr><td style="font-size: 20px; line-height: 20px;">&nbsp;</td></tr>
                          ${ ctaText && ctaLink ? `
                          <tr>
                              <td align="center">
                                  <table role="presentation" border="0" cellpadding="0" cellspacing="0">
                                      <tr>
                                          <td>
                                            <div><!--[if mso]>
                                              <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="${ctaLink}" style="height:50px;v-text-anchor:middle;width:200px;" arcsize="10%" strokecolor="${mainButtonColor}" fillcolor="${mainButtonColor}">
                                                <w:anchorlock/>
                                                <center style="color:#ffffff;font-family:sans-serif;font-size:16px;font-weight:bold;">${ctaText}</center>
                                              </v:roundrect>
                                            <![endif]--><a href="${ctaLink}"
                                            style="background-color:${mainButtonColor};border:none;border-radius:5px;color:#ffffff;display:inline-block;font-family:sans-serif;font-size:16px;font-weight:bold;line-height:50px;text-align:center;text-decoration:none;width:200px;-webkit-text-size-adjust:none;mso-hide:all;">${ctaText}</a></div>
                                          </td>
                                      </tr>
                                  </table>
                              </td>
                          </tr>
                          <tr><td style="font-size: 20px; line-height: 20px;">&nbsp;</td></tr>
                          `: ''}
                          ${offersHtml ? `<tr><td><table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">${offersHtml}</table></td></tr>` : '' }
                          ${ disclaimer ? `
                          <tr>
                              <td style="text-align: center; padding: 20px; font-family: Arial, sans-serif; font-size: 12px; line-height: 1.5; color: #718096;">
                                  ${disclaimer.replace(/\n/g, '<br />')}
                              </td>
                          </tr>
                          ` : '' }
                      </td>
                  </tr>
              </table>
              <!--[if mso]>
              </td>
              </tr>
              </table>
              <![endif]-->
          </div>
      </center>
  </body>
  </html>`;
};

const handleFormSubmit = async (e: Event) => {
  e.preventDefault();
  setLoading(true);
  outputPlaceholder.style.display = 'flex';
  outputContainer.style.display = 'none';
  outputPlaceholder.innerHTML = `<p>Generating your email...</p>`;

  try {
    const formData = new FormData(emailForm);
    const subject = formData.get('subject') as string;
    const bodyContent = formData.get('email-body') as string;
    const bodyBackgroundColor = formData.get('body_bg_color') as string;
    const ctaText = formData.get('cta') as string;
    const ctaLink = formData.get('cta_link') as string;
    const ctaColor = formData.get('cta_color') as string;
    const mainDisclaimer = formData.get('disclaimer') as string;
    const heroPhotoFile = formData.get('photo') as File;

    let heroImageDataUrl = '';
    if (heroPhotoFile && heroPhotoFile.size > 0) {
      heroImageDataUrl = await readFileAsDataURL(heroPhotoFile);
    }

    const offersData = [];
    for (let i = 1; i <= 3; i++) {
      const offerBlock = document.getElementById(`offer-block-${i}`);
      if (!offerBlock || offerBlock.style.display === 'none') {
        continue;
      }

      const vehicle = formData.get(`offer_vehicle_${i}`) as string;
      const title = formData.get(`offer_title_${i}`) as string;
      const details = formData.get(`offer_details_${i}`) as string;

      if (vehicle || title || details) {
        const offerImageFile = formData.get(`offer_image_${i}`) as File;
        let offerImageDataUrl = '';
        if (offerImageFile && offerImageFile.size > 0) {
          offerImageDataUrl = await readFileAsDataURL(offerImageFile);
        }
        offersData.push({
          vehicle,
          title,
          details,
          ctaText: formData.get(`offer_cta_text_${i}`) as string,
          ctaLink: formData.get(`offer_cta_link_${i}`) as string,
          ctaColor: formData.get(`offer_cta_color_${i}`) as string,
          disclaimer: formData.get(`offer_disclaimer_${i}`) as string,
          imageDataUrl: offerImageDataUrl,
        });
      }
    }

    const emailData = {
      subject,
      bodyContent,
      bodyBackgroundColor,
      heroImage: heroImageDataUrl,
      ctaText,
      ctaLink,
      ctaColor,
      offers: offersData,
      disclaimer: mainDisclaimer,
    };

    const emailHtml = generateEmailHtml(emailData);

    previewPane.srcdoc = emailHtml;
    codeBlock.textContent = emailHtml;
    
    outputPlaceholder.style.display = 'none';
    outputContainer.style.display = 'grid';

  } catch (error) {
    console.error(error);
    outputPlaceholder.innerHTML = `<p>An error occurred. Please check the console for details and try again.</p>`;
    outputPlaceholder.style.display = 'flex';
    outputContainer.style.display = 'none';
  } finally {
    setLoading(false);
  }
};

const handleCopyClick = async () => {
  if (!codeBlock.textContent) return;
  try {
    await navigator.clipboard.writeText(codeBlock.textContent);
    copyBtn.textContent = 'Copied!';
    setTimeout(() => {
      copyBtn.textContent = 'Copy HTML';
    }, 2000);
  } catch (err) {
    console.error('Failed to copy text: ', err);
    alert('Failed to copy HTML. Please try again.');
  }
};

const setupOfferManagement = () => {
    addOfferBtn.addEventListener('click', () => {
        const offer2 = document.getElementById('offer-block-2') as HTMLElement;
        const offer3 = document.getElementById('offer-block-3') as HTMLElement;

        if (offer2.style.display === 'none') {
            offer2.style.display = 'block';
        } else if (offer3.style.display === 'none') {
            offer3.style.display = 'block';
        }
        updateAddButtonVisibility();
    });

    const updateAddButtonVisibility = () => {
        const offer2 = document.getElementById('offer-block-2') as HTMLElement;
        const offer3 = document.getElementById('offer-block-3') as HTMLElement;
        if (offer2.style.display !== 'none' && offer3.style.display !== 'none') {
            addOfferBtn.style.display = 'none';
        } else {
            addOfferBtn.style.display = 'block';
        }
    };

    document.querySelectorAll('.remove-offer-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const target = e.currentTarget as HTMLButtonElement;
            const offerNum = target.dataset.offerNum;
            const offerBlock = document.getElementById(`offer-block-${offerNum}`) as HTMLElement;
            offerBlock.style.display = 'none';
            offerBlock.querySelectorAll('input, textarea').forEach((input: any) => {
                 input.value = '';
            });
            const previewImg = document.getElementById(`offer_image_preview_${offerNum}`) as HTMLImageElement;
            if (previewImg) {
                previewImg.src = 'https://placehold.co/100x100/f1f3f5/6c757d?text=Image';
            }
            updateAddButtonVisibility();
        });
    });

    document.querySelectorAll('.offer-image-input').forEach(input => {
       input.addEventListener('change', (e) => {
           const target = e.target as HTMLInputElement;
           const file = target.files?.[0];
           if (file) {
               const offerNum = target.id.split('_')[2];
               const previewImg = document.getElementById(`offer_image_preview_${offerNum}`) as HTMLImageElement;
               if (previewImg) {
                   const reader = new FileReader();
                   reader.onload = (event) => {
                       previewImg.src = event.target?.result as string;
                   };
                   reader.readAsDataURL(file);
               }
           }
       });
    });
};

const setupMergeFieldInserter = () => {
    let lastFocusedInput: HTMLInputElement | HTMLTextAreaElement | null = null;
    const mergeFieldItems = document.querySelectorAll('.merge-field-item');
    const targetInputs = document.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>('input[type="text"], textarea');

    targetInputs.forEach(input => {
        input.addEventListener('focus', () => {
            lastFocusedInput = input;
        });
    });

    mergeFieldItems.forEach(item => {
        item.addEventListener('click', () => {
            const valueToInsert = (item as HTMLElement).dataset.value;
            if (valueToInsert && lastFocusedInput) {
                // Ensure the focused element is still in the DOM
                if (!document.body.contains(lastFocusedInput)) {
                    lastFocusedInput = null;
                    return;
                }
                
                const startPos = lastFocusedInput.selectionStart ?? 0;
                const endPos = lastFocusedInput.selectionEnd ?? 0;
                const text = lastFocusedInput.value;
                
                lastFocusedInput.value = text.substring(0, startPos) + valueToInsert + text.substring(endPos, text.length);
                
                const newCursorPos = startPos + valueToInsert.length;
                lastFocusedInput.focus();
                lastFocusedInput.setSelectionRange(newCursorPos, newCursorPos);
            }
        });
    });
};


emailForm.addEventListener('submit', handleFormSubmit);
copyBtn.addEventListener('click', handleCopyClick);
document.addEventListener('DOMContentLoaded', () => {
    setupOfferManagement();
    setupMergeFieldInserter();
});