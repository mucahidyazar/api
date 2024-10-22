import { cleanEmptyFields } from './cleanEmptyFields'; // Fonksiyonunuzun bulunduğu dosyayı import edin

describe('cleanEmptyFields', () => {
  it('should remove empty fields with default options', () => {
    const input = {
      name: 'John',
      age: 0,
      address: '',
      hobbies: [],
      profile: { bio: '', social: {} },
      status: false,
      nullField: null,
      undefinedField: undefined,
      nanField: NaN,
    };

    const expected = {
      name: 'John',
      age: 0,
      status: false,
    };

    expect(cleanEmptyFields(input)).toEqual(expected);
  });

  it('should respect custom options', () => {
    const input = {
      name: 'John',
      age: 0,
      address: '',
      hobbies: [],
      profile: { bio: '', social: {} },
      status: false,
    };

    const options = {
      isZero: true,
      isFalse: true,
    };

    const expected = {
      name: 'John',
    };

    expect(cleanEmptyFields(input, options)).toEqual(expected);
  });

  it('should handle nested objects and arrays', () => {
    const input = {
      user: {
        name: 'John',
        details: {
          age: 0,
          address: '',
        },
      },
      posts: [
        { title: 'Post 1', comments: [] },
        { title: '', comments: ['Nice!'] },
      ],
    };

    const expected = {
      user: {
        name: 'John',
        details: {
          age: 0,
        },
      },
      posts: [
        { title: 'Post 1' },
        { comments: ['Nice!'] },
      ],
    };

    expect(cleanEmptyFields(input)).toEqual(expected);
  });

  it('should handle custom empty check', () => {
    const input = {
      name: 'John',
      status: 'inactive',
      role: 'user',
    };

    const options = {
      customEmpty: (val: string) => val === 'inactive' || val === 'user',
    };

    const expected = {
      name: 'John',
    };

    expect(cleanEmptyFields(input, options)).toEqual(expected);
  });

  it('should handle circular references', () => {
    const circular: any = { prop: 'value' };
    circular.self = circular;

    const input = {
      normal: 'data',
      circular: circular,
    };

    const result = cleanEmptyFields(input);

    expect(result).toHaveProperty('normal', 'data');
    expect(result).toHaveProperty('circular.prop', 'value');
    expect(result.circular.self).toBe(result.circular); // Circular reference should be preserved
  });

  it('should handle arrays with empty elements', () => {
    const input = {
      numbers: [1, '', null, 3, [], {}, 5],
    };

    const expected = {
      numbers: [1, 3, 5],
    };

    expect(cleanEmptyFields(input)).toEqual(expected);
  });

  it('should return the original value if maximum recursion depth is exceeded', () => {
    const deeplyNested: any = {};
    let current = deeplyNested;
    for (let i = 0; i < 150; i++) {
      current.next = { value: i };
      current = current.next;
    }

    const input = {
      deep: deeplyNested,
    };

    expect(() => cleanEmptyFields(input)).not.toThrow();
    expect(cleanEmptyFields(input)).toEqual(input);
  });
});