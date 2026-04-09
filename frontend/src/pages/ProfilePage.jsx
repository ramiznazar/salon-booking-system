function ProfilePage() {
  return (
    <section className="lumina-page">
      <div className="section-wrap">
        <section className="lumina-block">
          <div className="lumina-section-head">
            <div>
              <h2>Profile</h2>
              <p>Customer account, addresses, and membership preferences.</p>
            </div>
          </div>

          <div className="lumina-service-list" style={{ marginTop: '14px' }}>
            <article className="lumina-service-item">
              <div>
                <h3>Account Info</h3>
                <p>Demo User - user@example.com</p>
              </div>
              <div>
                <strong>Verified</strong>
                <button type="button">Edit</button>
              </div>
            </article>

            <article className="lumina-service-item">
              <div>
                <h3>Saved Address</h3>
                <p>Via Milano 12, Catanzaro</p>
              </div>
              <div>
                <strong>Primary</strong>
                <button type="button">Update</button>
              </div>
            </article>

            <article className="lumina-service-item">
              <div>
                <h3>Membership</h3>
                <p>Premium plan active, renews monthly.</p>
              </div>
              <div>
                <strong>Active</strong>
                <button type="button">Manage</button>
              </div>
            </article>
          </div>
        </section>
      </div>
    </section>
  )
}

export default ProfilePage
