function isValidDate(value) {
  const date = new Date(value);
  return value && !Number.isNaN(date.getTime());
}

function normalizeString(value) {
  return typeof value === 'string' ? value.trim() : '';
}

export function validateLostItem(payload) {
  const errors = [];
  if (!payload || typeof payload !== 'object') {
    errors.push({ field: 'payload', message: 'Request payload is required' });
    return errors;
  }

  const title = normalizeString(payload.title);
  const category = normalizeString(payload.category);
  const color = normalizeString(payload.color);
  const description = normalizeString(payload.description);
  const dateLost = payload.dateLost;
  const locationLost = normalizeString(payload.locationLost);
  const verificationQuestion = normalizeString(payload.verificationQuestion);
  const verificationAnswer = normalizeString(payload.verificationAnswer);

  if (!title) {
    errors.push({ field: 'title', message: 'Title is required' });
  } else if (title.length < 5) {
    errors.push({ field: 'title', message: 'Title must be at least 5 characters' });
  } else if (title.length > 100) {
    errors.push({ field: 'title', message: 'Title must be 100 characters or less' });
  }

  if (!category) {
    errors.push({ field: 'category', message: 'Category is required' });
  }

  if (!color) {
    errors.push({ field: 'color', message: 'Color is required' });
  }

  if (!description) {
    errors.push({ field: 'description', message: 'Description is required' });
  } else if (description.length < 30) {
    errors.push({ field: 'description', message: 'Description must be at least 30 characters' });
  } else if (description.length > 1000) {
    errors.push({ field: 'description', message: 'Description must be 1000 characters or less' });
  }

  if (!dateLost) {
    errors.push({ field: 'dateLost', message: 'Date lost is required' });
  } else if (!isValidDate(dateLost)) {
    errors.push({ field: 'dateLost', message: 'Date lost must be a valid date' });
  } else if (new Date(dateLost) > new Date()) {
    errors.push({ field: 'dateLost', message: 'Date lost cannot be in the future' });
  }

  if (!locationLost) {
    errors.push({ field: 'locationLost', message: 'Location lost is required' });
  } else if (locationLost.length < 5) {
    errors.push({ field: 'locationLost', message: 'Location lost must be more specific' });
  }

  if (!verificationQuestion) {
    errors.push({ field: 'verificationQuestion', message: 'Verification question is required' });
  }

  if (!verificationAnswer) {
    errors.push({ field: 'verificationAnswer', message: 'Verification answer is required' });
  }

  return errors;
}

export function validateFoundItem(payload) {
  const errors = [];
  if (!payload || typeof payload !== 'object') {
    errors.push({ field: 'payload', message: 'Request payload is required' });
    return errors;
  }

  const title = normalizeString(payload.title);
  const category = normalizeString(payload.category);
  const color = normalizeString(payload.color);
  const description = normalizeString(payload.description);
  const dateFound = payload.dateFound;
  const locationFound = normalizeString(payload.locationFound);

  if (!title) {
    errors.push({ field: 'title', message: 'Title is required' });
  } else if (title.length < 5) {
    errors.push({ field: 'title', message: 'Title must be at least 5 characters' });
  } else if (title.length > 100) {
    errors.push({ field: 'title', message: 'Title must be 100 characters or less' });
  }

  if (!category) {
    errors.push({ field: 'category', message: 'Category is required' });
  }

  if (!color) {
    errors.push({ field: 'color', message: 'Color is required' });
  }

  if (!description) {
    errors.push({ field: 'description', message: 'Description is required' });
  } else if (description.length < 30) {
    errors.push({ field: 'description', message: 'Description must be at least 30 characters' });
  } else if (description.length > 1000) {
    errors.push({ field: 'description', message: 'Description must be 1000 characters or less' });
  }

  if (!dateFound) {
    errors.push({ field: 'dateFound', message: 'Date found is required' });
  } else if (!isValidDate(dateFound)) {
    errors.push({ field: 'dateFound', message: 'Date found must be a valid date' });
  } else if (new Date(dateFound) > new Date()) {
    errors.push({ field: 'dateFound', message: 'Date found cannot be in the future' });
  }

  if (!locationFound) {
    errors.push({ field: 'locationFound', message: 'Location found is required' });
  } else if (locationFound.length < 5) {
    errors.push({ field: 'locationFound', message: 'Location found must be more specific' });
  }

  return errors;
}

export function generateItemDto(item) {
  if (!item) return null;
  return {
    id: item._id?.toString() || item.id,
    type: item.type,
    title: item.title,
    category: item.category,
    color: item.color,
    description: item.description,
    dateLost: item.dateLost ? item.dateLost.toISOString() : null,
    dateFound: item.dateFound ? item.dateFound.toISOString() : null,
    locationLost: item.locationLost || '',
    locationFound: item.locationFound || '',
    brand: item.brand || '',
    contents: item.contents || '',
    verificationQuestion: item.verificationQuestion || '',
    imageUrl: item.imageUrl || '',
    status: item.status,
    claimed: item.claimed ?? false,
    creatorId: item.creatorId?.toString?.() || item.creatorId,
    createdAt: item.createdAt?.toISOString?.() || item.createdAt,
    updatedAt: item.updatedAt?.toISOString?.() || item.updatedAt
  };
}
