// @flow

//
// Copyright (c) 2017 Intel Corporation. All rights reserved.
// Use of this source code is governed by a MIT-style
// license that can be found in the LICENSE file.

export default (): string => {
  const array = new Uint32Array(1);
  return self.crypto.getRandomValues(array)[0];
};
