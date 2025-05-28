import Button from './Button';
import '../styles/tag.css';

export default function UIShowcase() {
  return (
    <div style={{padding: 32}}>
      <h1>UI Showcase</h1>
      <h2>Button Variations</h2>
      <div style={{display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 32}}>
        <div style={{display: 'flex', flexDirection: 'column', gap: 8}}>
          <small>variant="primary" size="md"</small>
          <Button variant="primary" size="md">Primary Button</Button>
        </div>
        <div style={{display: 'flex', flexDirection: 'column', gap: 8}}>
          <small>variant="secondary" size="md"</small>
          <Button variant="secondary" size="md">Secondary Button</Button>
        </div>
        <div style={{display: 'flex', flexDirection: 'column', gap: 8}}>
          <small>size="sm"</small>
          <Button size="sm">Small Button</Button>
        </div>
        <div style={{display: 'flex', flexDirection: 'column', gap: 8}}>
          <small>fullWidth</small>
          <Button fullWidth>Full Width Button</Button>
        </div>
        <div style={{display: 'flex', flexDirection: 'column', gap: 8}}>
          <small>disabled</small>
          <Button disabled>Disabled Button</Button>
        </div>
        <div style={{display: 'flex', flexDirection: 'column', gap: 8}}>
          <small>variant="danger"</small>
          <Button variant="danger">Danger</Button>
        </div>
        <div style={{display: 'flex', flexDirection: 'column', gap: 8}}>
          <small>variant="confirm"</small>
          <Button variant="confirm">Confirm</Button>
        </div>
        <div style={{display: 'flex', flexDirection: 'column', gap: 8}}>
          <small>variant="edit"</small>
          <Button variant="edit">Edit</Button>
        </div>
        <div style={{display: 'flex', flexDirection: 'column', gap: 8}}>
          <small>variant="submit"</small>
          <Button variant="submit">Submit</Button>
        </div>
      </div>
      <h2>Tag / Badge Variations</h2>
      <div style={{display: 'flex', gap: 16, flexWrap: 'wrap'}}>
        <div style={{display: 'flex', flexDirection: 'column', gap: 8}}>
          <small>tag tag--character</small>
          <span className="tag tag--character">キャラタグ</span>
        </div>
        <div style={{display: 'flex', flexDirection: 'column', gap: 8}}>
          <small>tag tag--active</small>
          <span className="tag tag--active">アクティブ</span>
        </div>
        <div style={{display: 'flex', flexDirection: 'column', gap: 8}}>
          <small>tag tag--inactive</small>
          <span className="tag tag--inactive">無効</span>
        </div>
        <div style={{display: 'flex', flexDirection: 'column', gap: 8}}>
          <small>tag tag--sub</small>
          <span className="tag tag--sub">サブスク</span>
        </div>
        <div style={{display: 'flex', flexDirection: 'column', gap: 8}}>
          <small>tag tag--free</small>
          <span className="tag tag--free">無料</span>
        </div>
        <div style={{display: 'flex', flexDirection: 'column', gap: 8}}>
          <small>tag tag--paid</small>
          <span className="tag tag--paid">買い切り</span>
        </div>
      </div>
    </div>
  );
} 