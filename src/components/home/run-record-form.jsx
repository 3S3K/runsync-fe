import { useState } from 'react';

import styles from './run-record-form.module.css';

const FIELDS = [
  { name: 'averagePace', label: '평균 페이스', placeholder: '6.43', step: '0.01' },
  { name: 'calories', label: '칼로리', placeholder: '450', step: '1' },
  { name: 'averageHeartRate', label: '평균 심박수', placeholder: '172', step: '1' },
  { name: 'cadence', label: '케이던스', placeholder: '167', step: '1' },
  { name: 'elevationGain', label: '고도 상승', placeholder: '5.0', step: '0.1' },
];

const INTEGER_FIELDS = ['calories', 'averageHeartRate', 'cadence'];

const INITIAL_VALUES = {
  averagePace: '',
  calories: '',
  averageHeartRate: '',
  cadence: '',
  elevationGain: '',
};

/**
 * 러닝 종료 후 세부 기록(사용자 입력 5값)을 받는 폼.
 * @param {(record: object) => void | Promise<void>} onSubmit 입력값을 숫자로 변환해 전달 (빈 칸은 제외)
 */
export default function RunRecordForm({ onSubmit }) {
  const [values, setValues] = useState(INITIAL_VALUES);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (isSubmitting) {
      return;
    }

    const record = {};
    FIELDS.forEach(({ name }) => {
      if (values[name] === '') {
        return;
      }

      record[name] = INTEGER_FIELDS.includes(name)
        ? parseInt(values[name], 10)
        : parseFloat(values[name]);
    });

    // 저장이 끝날 때까지 버튼을 막아 같은 기록이 두 번 저장되지 않게 한다
    setIsSubmitting(true);
    try {
      await onSubmit(record);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      className={styles.form}
      onSubmit={handleSubmit}
    >
      <div className={styles.fields}>
        {FIELDS.map(({ name, label, placeholder, step }) => (
          <label
            key={name}
            className={styles.field}
          >
            <span className={styles.label}>{label}</span>
            <input
              className={styles.input}
              type="number"
              name={name}
              value={values[name]}
              placeholder={placeholder}
              step={step}
              min="0"
              inputMode="decimal"
              onChange={handleChange}
            />
          </label>
        ))}
      </div>
      <button
        type="submit"
        className={styles.submitButton}
        disabled={isSubmitting}
      >
        {isSubmitting ? '저장 중...' : 'Input'}
      </button>
    </form>
  );
}
