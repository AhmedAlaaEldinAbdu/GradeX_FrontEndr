import React from 'react';
import { useTranslation } from 'react-i18next';
import FocusPoint from '@gradex/assets/icons/FocusPoint.svg';
import WavePattern from '@gradex/assets/illustrations/WavePattern.svg';
import PencilCup from '@gradex/assets/illustrations/PencilCup.svg';
import MainLogo from '@gradex/assets/identity/MainLogo.png';
import RyalIcon from '@gradex/assets/icons/Ryal.svg';
import EmailIcon from '@gradex/assets/icons/Email.svg';
import { FiGlobe, FiSmartphone } from 'react-icons/fi';
import { BsTelephoneFill } from 'react-icons/bs';

import type { InvoiceDto, InvoiceItemDto, SchoolInfo } from '@/services/api/types/invoice.types';
import type { CustomerDto } from '@/services/api/types/customer.types';

export interface InvoicePDFTemplateProps {
  invoice?:
    | (InvoiceDto & { taxNumber?: string; schoolAddress?: string; taxAmount?: number })
    | null;
  customer?: (CustomerDto & { code?: string }) | null;
}

const InvoicePDFTemplate = React.forwardRef<HTMLDivElement, InvoicePDFTemplateProps>(
  ({ invoice, customer }, ref) => {
    const { i18n } = useTranslation();
    const isAr = i18n.language === 'ar';
    const dash = '-';

    const schoolName =
      invoice?.schoolBranchName ??
      (isAr ? invoice?.schoolBranchNameAr : invoice?.schoolBranchNameEn) ??
      dash;
    const paymentMethodName =
      invoice?.paymentMethodName ??
      (isAr ? invoice?.paymentMethodNameAr : invoice?.paymentMethodNameEn) ??
      dash;
    const schoolInfo: SchoolInfo | null | undefined = invoice?.schoolInfo;

    const schoolAddress =
      [schoolInfo?.street, schoolInfo?.neighborhood, schoolInfo?.city, schoolInfo?.region]
        .filter(Boolean)
        .join(' - ') ||
      (invoice as any)?.schoolAddress ||
      dash;

    const invoiceItems = invoice?.items ?? invoice?.invoiceItemDtos ?? [];

    // Format helpers
    const formatDate = (dateString?: string | null) =>
      dateString ? dateString.split('T')[0] : dash;

    const currencyStr = isAr ? 'ريال سعودي' : 'SAR';

    return (
      <div
        ref={ref}
        style={{
          width: '794px',
          minHeight: '1123px',
          backgroundColor: '#FCFCFC',
          fontFamily: 'Tajawal, "Helvetica Neue", sans-serif',
          color: '#333333',
          direction: isAr ? 'rtl' : 'ltr',
          position: 'relative',
          padding: '0',
          margin: '0',
          overflow: 'hidden',
        }}
      >
        {/* Top Background Wave Pattern */}
        <img
          src={WavePattern}
          alt="Wave"
          style={{
            position: 'absolute',
            top: 0,
            [isAr ? 'right' : 'left']: 0,
            width: '260px',
            zIndex: 0,
            opacity: 0.8,
            transform: isAr ? 'none' : 'scaleX(-1)',
          }}
        />

        <div
          style={{
            padding: '50px 40px',
            position: 'relative',
            zIndex: 1,
            minHeight: '1123px',
            boxSizing: 'border-box',
          }}
        >
          {/* Header Section */}
          {/* We use a relative container ensuring vertical centering for the logo and the texts */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              paddingTop: '20px',
            }}
          >
            {/* Top Right (Empty placeholder to balance flex space-between in RTL) */}
            <div style={{ flex: 1 }}></div>

            {/* Center Logo */}
            <div
              style={{
                width: '110px',
                height: '110px',
                backgroundColor: '#1E5841',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 2,
              }}
            >
              <img
                src={MainLogo}
                alt="Logo"
                style={{ width: '70px', objectFit: 'contain', filter: 'brightness(0) invert(1)' }}
              />
            </div>

            <div
              style={{
                flex: 1,
                display: 'flex',
                gap: '8px',
                alignItems: 'center',
                direction: 'ltr',
                justifyContent: isAr ? 'flex-start' : 'flex-end',
                whiteSpace: 'nowrap',
              }}
            >
              <img src={FocusPoint} alt="Focus" style={{ width: '22px', height: '22px' }} />
              <p style={{ marginBottom: '20px' }}>
                <span style={{ fontSize: '13px', fontWeight: 'bold', color: '#444' }}>
                  {invoice?.taxNumber ?? dash}
                </span>
                <span
                  style={{
                    fontSize: '13px',
                    fontWeight: 'bold',
                    direction: isAr ? 'rtl' : 'ltr',
                    color: '#444',
                    margin: '0 4px',
                  }}
                >
                  {isAr ? 'الرقم الضريبي' : 'Tax Number'}
                </span>
              </p>
            </div>
          </div>

          {/* Invoice Title & School Info */}
          <div
            style={{
              marginTop: '20px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-end',
            }}
          >
            {/* School Name  */}
            <div style={{ textAlign: isAr ? 'right' : 'left' }}>
              <h1 style={{ margin: 0, fontSize: '26px', color: '#111' }}>{schoolName}</h1>
              <p style={{ margin: '14px 0 0 0', fontSize: '13px', color: '#666' }}>
                {schoolAddress}
              </p>
            </div>

            {/* Date  */}
            <div style={{ fontSize: '13px', color: '#666', marginBottom: '2px' }}>
              {isAr ? 'تاريخ الفاتورة:' : 'Invoice Date:'}{' '}
              <span style={{ direction: 'ltr', display: 'inline-block' }}>
                {formatDate(invoice?.invoiceDate)}
              </span>
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginTop: '30px',
              fontSize: '13px',
              lineHeight: '2',
              flexDirection: isAr ? 'row' : 'row-reverse',
            }}
          >
            {/* Left / Right Column switch based on RTL */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                textAlign: isAr ? 'right' : 'left',
                flex: 1,
                paddingRight: isAr ? '40px' : '0',
                paddingLeft: isAr ? '0' : '40px',
              }}
            >
              <div>
                <span style={{ color: '#888', display: 'inline-block', width: '120px' }}>
                  {isAr ? 'رقم الفاتورة:' : 'Invoice No:'}{' '}
                </span>
                <span style={{ fontWeight: '600', direction: 'ltr', display: 'inline-block' }}>
                  {invoice?.invoiceNumber ?? dash}
                </span>
              </div>
              <div>
                <span style={{ color: '#888', display: 'inline-block', width: '120px' }}>
                  {isAr ? 'رقم العميل:' : 'Customer ID:'}{' '}
                </span>
                <span style={{ fontWeight: '600' }}>
                  {customer?.code ?? invoice?.customerId?.substring(0, 8) ?? dash}
                </span>
              </div>
              <div>
                <span style={{ color: '#888', display: 'inline-block', width: '120px' }}>
                  {isAr ? 'البريد الإلكتروني:' : 'Email:'}{' '}
                </span>
                <span style={{ fontWeight: '600', fontFamily: 'sans-serif' }}>
                  {customer?.email ?? dash}
                </span>
              </div>
              <div>
                <span style={{ color: '#888', display: 'inline-block', width: '120px' }}>
                  {isAr ? 'طريقة السداد:' : 'Payment Type:'}{' '}
                </span>
                <span style={{ fontWeight: '600' }}>
                  {invoice?.paymentType === 1
                    ? isAr
                      ? 'نقدي'
                      : 'Cash'
                    : invoice?.paymentType === 2
                      ? isAr
                        ? 'تقسيط'
                        : 'Installment'
                      : dash}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <span style={{ color: '#888', display: 'inline-block', width: '120px' }}>
                  {isAr ? 'تاريخ الاستحقاق:' : 'Due Date:'}{' '}
                </span>
                <span style={{ fontWeight: '600', direction: 'ltr' }}>
                  {formatDate(invoice?.dueDate)}
                </span>
              </div>
            </div>

            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                textAlign: isAr ? 'right' : 'left',
                flex: 1,
              }}
            >
              <div>
                <span style={{ color: '#888', display: 'inline-block', width: '90px' }}>
                  {isAr ? 'اسم العميل:' : 'Customer:'}{' '}
                </span>
                <span style={{ fontWeight: '600' }}>{invoice?.customerName ?? dash}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <span style={{ color: '#888', display: 'inline-block', width: '90px' }}>
                  {isAr ? 'رقم الجوال:' : 'Mobile:'}{' '}
                </span>
                <span style={{ fontWeight: '600', direction: 'ltr' }}>
                  {invoice?.phoneNumber
                    ? `${customer?.areaCode ?? ''} ${invoice.phoneNumber}`.trim()
                    : dash}
                </span>
              </div>
              <div>
                <span style={{ color: '#888', display: 'inline-block', width: '90px' }}>
                  {isAr ? 'وسيلة السداد:' : 'Payment Tool:'}{' '}
                </span>
                <span style={{ fontWeight: '600' }}>{paymentMethodName}</span>
              </div>
            </div>
          </div>

          {/* Table Section */}
          <div style={{ marginTop: '30px' }}>
            <div
              style={{
                display: 'flex',
                backgroundColor: '#0E894B',
                color: '#FFF',
                borderRadius: '40px',
                padding: '4px 0',
                fontSize: '13px',
                fontWeight: '700',
                alignItems: 'center',
                boxSizing: 'border-box',
                width: '100%',
              }}
            >
              <div
                style={{
                  width: '60px',
                  textAlign: 'center',
                  display: 'block',
                  marginBottom: '15px',
                }}
              >
                #
              </div>
              <div
                style={{
                  width: '250px',
                  textAlign: 'center',
                  display: 'block',
                  marginBottom: '15px',
                }}
              >
                {isAr ? 'البند' : 'Item'}
              </div>
              <div
                style={{
                  width: '101px',
                  textAlign: 'center',
                  display: 'block',
                  marginBottom: '15px',
                }}
              >
                {isAr ? 'سعر الوحدة' : 'Unit Price'}
              </div>
              <div
                style={{
                  width: '101px',
                  textAlign: 'center',
                  display: 'block',
                  marginBottom: '15px',
                }}
              >
                {isAr ? 'الكمية' : 'Qty'}
              </div>
              <div
                style={{
                  width: '101px',
                  textAlign: 'center',
                  display: 'block',
                  marginBottom: '15px',
                }}
              >
                {isAr ? 'الخصم' : 'Discount'}
              </div>
              <div
                style={{
                  width: '101px',
                  textAlign: 'center',
                  display: 'block',
                  marginBottom: '15px',
                }}
              >
                {isAr ? 'الإجمالي' : 'Total'}
              </div>
            </div>

            {/* Table Body */}
            <table
              style={{
                width: '100%',
                tableLayout: 'fixed',
                borderCollapse: 'collapse',
                textAlign: 'center',
                fontSize: '13px',
              }}
            >
              <tbody>
                {invoiceItems.length > 0 ? (
                  invoiceItems.map(
                    (item: InvoiceItemDto & { quantity?: number }, index: number) => {
                      const amount = item.amount ?? 0;
                      const qty = item.quantity ?? 1;
                      const discount = item.discount ?? 0;
                      const total = amount * qty - discount;

                      return (
                        <tr key={item.id ?? index}>
                          <td
                            style={{
                              width: '60px',
                              padding: '20px 0',
                              color: '#555',
                              textAlign: 'center',
                            }}
                          >
                            {index + 1}
                          </td>
                          <td
                            style={{
                              width: '250px',
                              padding: '20px 0',
                              color: '#555',
                              textAlign: 'center',
                            }}
                          >
                            {item.name ?? dash}
                          </td>
                          <td style={{ width: '101px', padding: '20px 0', color: '#444' }}>
                            <div
                              style={{
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                gap: '6px',
                                direction: 'ltr',
                              }}
                            >
                              <img
                                src={RyalIcon}
                                style={{
                                  width: '13px',
                                  filter: 'brightness(0) invert(0.6)',
                                  marginTop: '15px',
                                }}
                              />
                              <span>{amount}</span>
                            </div>
                          </td>
                          <td
                            style={{
                              width: '101px',
                              padding: '20px 0',
                              color: '#444',
                              textAlign: 'center',
                            }}
                          >
                            <span>{qty}</span>
                          </td>
                          <td style={{ width: '101px', padding: '20px 0', color: '#444' }}>
                            <div
                              style={{
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                gap: '6px',
                                direction: 'ltr',
                              }}
                            >
                              <img
                                src={RyalIcon}
                                style={{
                                  width: '13px',
                                  filter: 'brightness(0) invert(0.6)',
                                  marginTop: '15px',
                                }}
                              />
                              <span>{discount}</span>
                            </div>
                          </td>
                          <td style={{ width: '101px', padding: '20px 0', color: '#444' }}>
                            <div
                              style={{
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                gap: '6px',
                                direction: 'ltr',
                              }}
                            >
                              <img
                                src={RyalIcon}
                                style={{
                                  width: '13px',
                                  filter: 'brightness(0) invert(0.6)',
                                  marginTop: '15px',
                                }}
                              />
                              <span>{total}</span>
                            </div>
                          </td>
                        </tr>
                      );
                    }
                  )
                ) : (
                  <tr>
                    <td
                      colSpan={6}
                      style={{ padding: '20px 0', textAlign: 'center', color: '#888' }}
                    >
                      {dash}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Summary Section */}
          <div
            style={{
              marginTop: '20px',
              fontSize: '13px',
              marginLeft: isAr ? '30px' : '0',
              marginRight: isAr ? '0' : '30px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '14px 0' }}>
              <span style={{ color: '#888' }}>{isAr ? 'إجمالي المبلغ:' : 'Total Amount:'}</span>
              <span style={{ fontWeight: 'bold' }}>
                {invoice?.totalAmount ?? dash} {currencyStr}
              </span>
            </div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '14px 0',
                borderBottom: '1px solid #EAEAEA',
              }}
            >
              <span style={{ color: '#888' }}>
                {isAr ? 'ضريبة القيمة المضافة' : 'VAT'} ({invoice?.taxPercentage ?? 0}%):
              </span>
              <span style={{ fontWeight: 'bold', direction: 'ltr' }}>
                {invoice?.taxPercentage
                  ? ((invoice.netAmount * invoice.taxPercentage) / 100).toFixed(2)
                  : dash}{' '}
                {currencyStr}
              </span>
            </div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '14px 0',
                borderBottom: '1px solid #EAEAEA',
              }}
            >
              <span style={{ color: '#888' }}>- {isAr ? 'الخصم' : 'Discount'}</span>
              <span style={{ fontWeight: 'bold' }}>
                {invoice?.totalDiscount ?? dash} {currencyStr}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '14px 0' }}>
              <span style={{ color: '#888' }}>{isAr ? 'الإجمالي:' : 'Net Amount:'}</span>
              <span style={{ fontWeight: 'bold' }}>
                {invoice?.netAmount ?? dash} {currencyStr}
              </span>
            </div>
          </div>

          {/* Payment Statement  */}
          <div style={{ marginTop: '20px', position: 'relative', zIndex: 2 }}>
            <h3
              style={{
                fontSize: '16px',
                marginBottom: '14px',
                color: '#333',
                textAlign: isAr ? 'right' : 'left',
              }}
            >
              {isAr ? 'بيان السداد' : 'Payment Statement'}
            </h3>
            <div
              style={{
                backgroundColor: '#DBF5E5',
                borderRadius: '8px',
                padding: '18px 30px',
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '14px',
                color: '#138650',
                marginBottom: '10px',
              }}
            >
              <span>
                {isAr ? 'الإجمالي:' : 'Total:'}{' '}
                <span style={{ fontWeight: '700' }}>
                  {invoice?.netAmount ?? dash} {currencyStr}
                </span>
              </span>
              <span>
                {isAr ? 'المسدد:' : 'Paid:'}{' '}
                <span style={{ fontWeight: '700' }}>
                  {invoice?.paidAmount ?? dash} {currencyStr}
                </span>
              </span>
              <span>
                {isAr ? 'المستحق:' : 'Due:'}{' '}
                <span style={{ fontWeight: '700' }}>
                  {invoice?.dueAmount ?? dash} {currencyStr}
                </span>
              </span>
            </div>
          </div>

          {/* Footer Area Elements */}
          {/* QR Code */}
          {/* <div
            style={{
              position: 'absolute',
              [isAr ? 'right' : 'left']: '40px',
              bottom: '115px',
              zIndex: 3,
            }}
          >
            <img
              src={`https://api.qrserver.com/v1/create-qr-code/?size=85x85&data=${invoice?.id ?? 'Invoice'}`}
              alt="QR"
              style={{ width: '85px', height: '85px' }}
            />
          </div> */}

          {/* Pencil Cup */}
          <img
            src={PencilCup}
            alt="Pencil Cup"
            style={{
              position: 'absolute',
              [isAr ? 'left' : 'right']: '0px',
              bottom: '-80px',
              width: '180px',
              objectFit: 'contain',
              zIndex: 1,
              transform: isAr ? 'none' : 'scaleX(-1)', // Flip illustration if english
            }}
          />

          {/* Footer */}
          <div
            style={{
              position: 'absolute',
              bottom: '35px',
              [isAr ? 'left' : 'right']: '160px',
              [isAr ? 'right' : 'left']: '30px',
              height: '65px',
              zIndex: 4,
            }}
          >
            {/* The Green Bar Body */}
            <div
              style={{
                position: 'absolute',
                [isAr ? 'left' : 'right']: '30px',
                [isAr ? 'right' : 'left']: 0,
                top: 0,
                bottom: 0,
                backgroundColor: '#115C38',
                borderRadius: '40px',
                display: 'flex',
                alignItems: 'center',
                boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  width: '100%',
                  direction: 'ltr',
                  [isAr ? 'paddingLeft' : 'paddingRight']: '50px',
                  [isAr ? 'paddingRight' : 'paddingLeft']: '20px',
                  color: '#FFF',
                  fontSize: '13px',
                }}
              >
                <table style={{ borderCollapse: 'collapse', borderSpacing: 0 }}>
                  <tbody>
                    <tr>
                      <td style={{ verticalAlign: 'middle', padding: 0 }}>
                        <img
                          src={EmailIcon}
                          alt="email"
                          style={{
                            width: '13px',
                            display: 'block',
                            filter: 'brightness(0) invert(1)',
                            marginTop: '0px',
                          }}
                        />
                      </td>
                      <td style={{ verticalAlign: 'middle', padding: 0, paddingRight: '8px' }}>
                        <span style={{ color: '#FFF', display: 'block', marginBottom: '15px' }}>
                          {schoolInfo?.email ?? 'info@elm.com'}
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>

                <table style={{ borderCollapse: 'collapse', borderSpacing: 0 }}>
                  <tbody>
                    <tr>
                      <td style={{ verticalAlign: 'middle', padding: 0 }}>
                        <FiGlobe
                          style={{
                            width: '13px',
                            height: '13px',
                            display: 'block',
                            color: '#FFF',
                            marginTop: '0px',
                          }}
                        />
                      </td>
                      <td style={{ verticalAlign: 'middle', padding: 0, paddingRight: '8px' }}>
                        <span style={{ color: '#FFF', display: 'block', marginBottom: '15px' }}>
                          {schoolInfo?.webSite ?? 'www.elm.com'}
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>

                <table style={{ borderCollapse: 'collapse', borderSpacing: 0 }}>
                  <tbody>
                    <tr>
                      <td style={{ verticalAlign: 'middle', padding: 0, paddingLeft: '8px' }}>
                        <span style={{ color: '#FFF', display: 'block', marginBottom: '15px' }}>
                          {schoolInfo?.phoneNumber ?? '0500029999'}
                        </span>
                      </td>
                      <td style={{ verticalAlign: 'middle', padding: 0 }}>
                        <FiSmartphone
                          style={{
                            width: '13px',
                            height: '13px',
                            display: 'block',
                            color: '#FFF',
                            marginTop: '0px',
                          }}
                        />
                      </td>
                    </tr>
                  </tbody>
                </table>

                <table style={{ borderCollapse: 'collapse', borderSpacing: 0 }}>
                  <tbody>
                    <tr>
                      <td
                        style={{
                          verticalAlign: 'middle',
                          padding: 0,
                          paddingLeft: '8px',
                          marginBottom: '2px',
                        }}
                      >
                        <span style={{ color: '#FFF', display: 'block', marginBottom: '15px' }}>
                          {schoolInfo?.landlineNumber ?? '0112223333'}
                        </span>
                      </td>
                      <td style={{ verticalAlign: 'middle', padding: 0 }}>
                        <BsTelephoneFill
                          style={{
                            width: '12px',
                            height: '12px',
                            display: 'block',
                            color: '#FFF',
                            marginTop: '0px',
                          }}
                        />
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* ELM Logo Circle */}
            <div
              style={{
                position: 'absolute',
                [isAr ? 'left' : 'right']: '-20px',
                top: '50%',
                transform: 'translateY(-50%)',
                width: '90px',
                height: '90px',
                backgroundColor: '#115C38',
                borderRadius: '50%',
                border: '6px solid #FCFCFC',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <img
                src={MainLogo}
                alt="Logo"
                style={{ width: '56px', objectFit: 'contain', filter: 'brightness(0) invert(1)' }}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }
);

InvoicePDFTemplate.displayName = 'InvoicePDFTemplate';

export default InvoicePDFTemplate;
