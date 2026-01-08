import SVGComponent from './Svgcomponent';
import styles from './Loader.module.css';

const hexStyles = {
    width: '104px',
    height: '56px',
    margin: '500px auto',
    position: 'relative',
};

const hexItemStyles = [
    { marginLeft: '0px' },
    { marginLeft: '29px' },
    { marginLeft: '58px' },
    { marginLeft: '14px', marginTop: '24px' },
    { marginLeft: '43px', marginTop: '24px' },
    { marginLeft: '72px', marginTop: '24px' },
];

const Loader = () => {
    return (
        <div className={styles.loader}>
            <div style={hexStyles} className={styles.hex}>
                {hexItemStyles.map((style, index) => (
                    <div
                        key={index}
                        style={style}
                        className={`${styles.hexItem} ${styles[`hexItem-${index + 1}`]}`} // Apply different animation delays using dynamic classes
                    >
                        <SVGComponent />
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Loader;
