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
 * @param {(record: object) => void} onSubmit 입력값을 숫자로 변환해 전달 (빈 칸은 제외)
 */
export default function RunRecordForm({ onSubmit }) {
  const [values, setValues] = useState(INITIAL_VALUES);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const record = {};
    FIELDS.forEach(({ name }) => {
      if (values[name] === '') {
        return;
      }

      record[name] = INTEGER_FIELDS.includes(name)
        ? parseInt(values[name], 10)
        : parseFloat(values[name]);
    });

    onSubmit(record);
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
      >
        Input
      </button>
    </form>
  );
}
