import React from 'react';
import FocusPoint from '@gradex/assets/icons/FocusPoint.svg';
import WavePattern from '@gradex/assets/illustrations/WavePattern.svg';
import PencilCup from '@gradex/assets/illustrations/PencilCup.svg';
import MainLogo from '@gradex/assets/identity/MainLogo.png';
import RyalIcon from '@gradex/assets/icons/Ryal.svg';
import EmailIcon from '@gradex/assets/icons/Email.svg';
import { FiGlobe, FiSmartphone } from 'react-icons/fi';
import { BsTelephoneFill } from 'react-icons/bs';

const InvoicePDFTemplate = React.forwardRef<HTMLDivElement>((props, ref) => {
  return (
    <div
      ref={ref}
      style={{
        width: '794px',
        minHeight: '1123px',
        backgroundColor: '#FCFCFC',
        fontFamily: 'Tajawal, "Helvetica Neue", sans-serif',
        color: '#333333',
        direction: 'rtl',
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
          right: 0,
          width: '260px',
          zIndex: 0,
          opacity: 0.8,
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
              justifyContent: 'flex-start',
              whiteSpace: 'nowrap',
            }}
          >
            <img src={FocusPoint} alt="Focus" style={{ width: '22px', height: '22px' }} />
            <p style={{ marginBottom: '20px' }}>
              <span style={{ fontSize: '13px', fontWeight: 'bold', color: '#444' }}>
                345565767676878#
              </span>
              <span
                style={{ fontSize: '13px', fontWeight: 'bold', direction: 'rtl', color: '#444' }}
              >
                الرقم الضريبي
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
          <div style={{ textAlign: 'right' }}>
            <h1 style={{ margin: 0, fontSize: '26px', color: '#111' }}>اسم المدرسة</h1>
            <p style={{ margin: '14px 0 0 0', fontSize: '13px', color: '#666' }}>
              4246 السليمانية - طريق العروبة الرياض - المملكة العربية
            </p>
          </div>

          {/* Date  */}
          <div style={{ fontSize: '13px', color: '#666', marginBottom: '2px' }}>
            تاريخ الفاتورة:{' '}
            <span style={{ direction: 'ltr', display: 'inline-block' }}>21/09/2024</span>
          </div>
        </div>

        {/* Client Info Section */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginTop: '30px',
            fontSize: '13px',
            lineHeight: '2',
          }}
        >
          {/* Right Column */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              textAlign: 'right',
              flex: 1,
              paddingRight: '40px',
            }}
          >
            <div>
              <span style={{ color: '#888', display: 'inline-block', width: '120px' }}>
                رقم الفاتورة:{' '}
              </span>
              <span style={{ fontWeight: '600' }}>1245#</span>
            </div>
            <div>
              <span style={{ color: '#888', display: 'inline-block', width: '120px' }}>
                رقم العميل:{' '}
              </span>
              <span style={{ fontWeight: '600' }}>125</span>
            </div>
            <div>
              <span style={{ color: '#888', display: 'inline-block', width: '120px' }}>
                البريد الإلكتروني:{' '}
              </span>
              <span style={{ fontWeight: '600', fontFamily: 'sans-serif' }}>Ahmed@gmail.com</span>
            </div>
            <div>
              <span style={{ color: '#888', display: 'inline-block', width: '120px' }}>
                طريقة السداد:{' '}
              </span>
              <span style={{ fontWeight: '600' }}>أجل</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <span style={{ color: '#888', display: 'inline-block', width: '120px' }}>
                تاريخ الاستحقاق:{' '}
              </span>
              <span style={{ fontWeight: '600', direction: 'ltr' }}>21/09/2024</span>
            </div>
          </div>

          {/* Left Column */}
          <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'right', flex: 1 }}>
            <div>
              <span style={{ color: '#888', display: 'inline-block', width: '90px' }}>
                اسم العميل:{' '}
              </span>
              <span style={{ fontWeight: '600' }}>أحمد معتز حسن</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <span style={{ color: '#888', display: 'inline-block', width: '90px' }}>
                رقم الجوال:{' '}
              </span>
              <span style={{ fontWeight: '600', direction: 'rtl' }}>5678 1234 10 20+</span>
            </div>
            <div>
              <span style={{ color: '#888', display: 'inline-block', width: '90px' }}>
                وسيلة السداد:{' '}
              </span>
              <span style={{ fontWeight: '600' }}>محفظة إلكترونية</span>
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
              البند
            </div>
            <div
              style={{
                width: '101px',
                textAlign: 'center',
                display: 'block',
                marginBottom: '15px',
              }}
            >
              المبلغ
            </div>
            <div
              style={{
                width: '101px',
                textAlign: 'center',
                display: 'block',
                marginBottom: '15px',
              }}
            >
              المبلغ
            </div>
            <div
              style={{
                width: '101px',
                textAlign: 'center',
                display: 'block',
                marginBottom: '15px',
              }}
            >
              الخصم
            </div>
            <div
              style={{
                width: '101px',
                textAlign: 'center',
                display: 'block',
                marginBottom: '15px',
              }}
            >
              المبلغ
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
              <tr>
                <td
                  style={{ width: '60px', padding: '20px 0', color: '#555', textAlign: 'center' }}
                >
                  1
                </td>
                <td
                  style={{
                    width: '250px',
                    padding: '20px 0',
                    color: '#555',
                    textAlign: 'center',
                  }}
                >
                  الرسوم الدراسية - مرحلة kg2
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
                    <span>750</span>
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
                    <span>750</span>
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
                    <span>750</span>
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
                    <span>750</span>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Summary Section */}
        <div style={{ marginTop: '20px', fontSize: '13px', marginLeft: '30px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '14px 0' }}>
            <span style={{ color: '#888' }}>إجمالي المبلغ:</span>
            <span style={{ fontWeight: 'bold' }}>800 ريال سعودي</span>
          </div>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              padding: '14px 0',
              borderBottom: '1px solid #EAEAEA',
            }}
          >
            <span style={{ color: '#888' }}>ضريبة القيمة المضافة (15%):</span>
            <span style={{ fontWeight: 'bold' }}>40 ريال سعودي</span>
          </div>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              padding: '14px 0',
              borderBottom: '1px solid #EAEAEA',
            }}
          >
            <span style={{ color: '#888' }}>- الخصم</span>
            <span style={{ fontWeight: 'bold' }}>400 ريال سعودي</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '14px 0' }}>
            <span style={{ color: '#888' }}>الإجمالي:</span>
            <span style={{ fontWeight: 'bold' }}>800 ريال سعودي</span>
          </div>
        </div>

        {/* Payment Statement  */}
        <div style={{ marginTop: '20px', position: 'relative', zIndex: 2 }}>
          <h3 style={{ fontSize: '16px', marginBottom: '14px', color: '#333', textAlign: 'right' }}>
            بيان السداد
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
              الإجمالي: <span style={{ fontWeight: '700' }}>800 ريال سعودي</span>
            </span>
            <span>
              المسدد: <span style={{ fontWeight: '700' }}>800 ريال سعودي</span>
            </span>
            <span>
              المستحق: <span style={{ fontWeight: '700' }}>0 ريال سعودي</span>
            </span>
          </div>
        </div>

        {/* Footer Area Elements */}
        {/* QR Code */}
        <div style={{ position: 'absolute', right: '40px', bottom: '115px', zIndex: 3 }}>
          <img
            src="https://api.qrserver.com/v1/create-qr-code/?size=85x85&data=Invoice"
            alt="QR"
            style={{ width: '85px', height: '85px' }}
          />
        </div>

        {/* Pencil Cup */}
        <img
          src={PencilCup}
          alt="Pencil Cup"
          style={{
            position: 'absolute',
            left: '0px',
            bottom: '-80px',
            width: '180px',
            objectFit: 'contain',
            zIndex: 1,
          }}
        />

        {/* Footer */}
        <div
          style={{
            position: 'absolute',
            bottom: '35px',
            left: '160px',
            right: '30px',
            height: '65px',
            zIndex: 4,
          }}
        >
          {/* The Green Bar Body */}
          <div
            style={{
              position: 'absolute',
              left: '30px',
              right: 0,
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
                paddingLeft: '50px',
                paddingRight: '20px',
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
                        info@elm.com
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
                        www.elm.com
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
                        0500029999
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
                        0112223333
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
              left: '-20px',
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
});

InvoicePDFTemplate.displayName = 'InvoicePDFTemplate';

export default InvoicePDFTemplate;
