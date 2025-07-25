interface EmailTemplateProps {
  data: {
    request_type: string
    seller_name: string
  }
}

export const AdminRequestCreatedEmailTemplate: React.FC<Readonly<EmailTemplateProps>> = ({ data }) => {
  return (
    <div style={{
      maxWidth: 600,
      margin: '0 auto',
      fontFamily: 'Arial, sans-serif',
      color: '#222',
      background: '#fff',
      padding: 24,
      borderRadius: 10
    }}>
      <h1 style={{ fontSize: '2rem', marginBottom: 8 }}>
        Hello, <span role="img" aria-label="wave">👋</span>
      </h1>
      <p style={{ fontSize: '1.1rem', marginBottom: 16 }}>
        {data.seller_name} has requested to create a new {data.request_type}. Please review the request and approve it in admin panel.
      </p>
      <div style={{ marginTop: 32 }}>
        <div>Best regards,</div>
        <div style={{ fontWeight: 600 }}>The Mercur Team</div>
        <div style={{ color: '#888', marginTop: 4 }}>mercur.js</div>
      </div>
    </div>
  )
}