import React, { useState } from 'react';
import { ChevronRight } from 'lucide-react';
import styles from './Faq.module.css';
import faqIllustration from './assets/faq-illus.webp';

const FAQ = () => {
    const [activeIndex, setActiveIndex] = useState(null);

    const faqs = [
        {
            question: "What is NexFellow?",
            answer: "NexFellow is a professional platform designed to connect online creators, startups, and companies. It allows users to create and manage communities, and explore opportunities to grow their businesses or personal projects.",
        },
        {
            question: "How does NexFellow help in managing communities?",
            answer: "NexFellow provides software tools tailored for community management, such as event scheduling, analytics, member engagement features, and tools for effective communication within the community.",
        },
        {
            question: "Can NexFellow help businesses generate leads?",
            answer: "Yes! NexFellow is designed to help businesses, course sellers, and creators gain visibility and attract leads through targeted community-building strategies and exposure to a wide network of users.",
        },
        {
            question: "What makes NexFellow different from other social platforms?",
            answer: "NexFellow focuses on connecting geeks and professionals within interest-based communities. It also integrates community management tools, business lead generation, and collaboration opportunities in a single platform.",
        },
        {
            question: "How do startups and companies benefit from NexFellow?",
            answer: "Startups and companies can use NexFellow to network with talent, promote their services, and find collaboration opportunities with other businesses or professionals.",
        },
    ];

    const toggleFAQ = (index) => {
        setActiveIndex(activeIndex === index ? null : index);
    };

    return (
        <div className={styles.container}>
            <div className={styles.content}>
                <div className={styles.illustrationContainer}>
                    <h1 className={styles.illustrationTitle}>
                        Frequently Asked <br />
                        <span className={styles.highlight}>Questions</span>
                    </h1>
                    <img src={faqIllustration.src || faqIllustration} alt="FAQ Illustration" className={styles.illustration} />
                </div>
                <div className={styles.faqs}>
                    {faqs.map((faq, index) => (
                        <div
                            key={index}
                            className={`${styles.faqItem} ${activeIndex === index ? styles.active : ''}`}
                            onClick={() => toggleFAQ(index)}
                        >
                            <div className={styles.questionContainer}>
                                <div className={styles.questionNumber}>0{index + 1}</div>
                                <div className={styles.question}>
                                    {faq.question}
                                    <span
                                        className={`${styles.icon} ${activeIndex === index ? styles.rotate : ''}`}
                                    >
                                        <ChevronRight size={25} />
                                    </span>
                                </div>
                            </div>
                            <div
                                className={`${styles.answerWrapper} ${activeIndex === index ? styles.open : ''
                                    }`}
                            >
                                <div className={styles.answer}>
                                    {faq.answer}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default FAQ;
