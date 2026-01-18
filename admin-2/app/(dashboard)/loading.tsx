import { Loader } from '@/components/ui/Loader';

export default function Loading() {
    return (
        <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '50vh'
        }}>
            <Loader />
        </div>
    );
}
