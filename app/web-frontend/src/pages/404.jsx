function Page404() {
  return (
    <div style={{
      minHeight: '60vh', display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column', gap: '16px',
    }}
    >
      <h4 style={{ fontSize: '36px', fontWeight: 'bold' }}>
        404: Not Found
      </h4>
      <p style={{ fontSize: '24px' }}>
        The page you are looking for does not exist
      </p>
    </div>
  );
}

export default Page404;
